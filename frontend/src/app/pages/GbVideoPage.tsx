import { Play, Radio, StopCircle, Video, Mic, MicOff, PlugZap } from "lucide-react";
import { Field, HintPanel, PrimaryButton, QuickFillButton, ResultPanel, ResultPreviewList, ResultSummary, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery, findArrayByObjectKeys, findFirstArray, findFirstByKeys, fromDatetimeLocalValue, toDatetimeLocalValue } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useEffect, useMemo, useRef, useState } from "react";

function buildWebSocketUrl(path: string) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/proxy";
  const httpUrl = new URL(apiBase);
  const wsProtocol = httpUrl.protocol === "https:" ? "wss:" : "ws:";
  return new URL(path, `${wsProtocol}//${httpUrl.host}`).toString();
}

function pcm16ToBase64(buffer: Int16Array) {
  const bytes = new Uint8Array(buffer.buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function downsampleTo8k(input: Float32Array, sourceRate: number) {
  if (sourceRate === 8000) return input;
  const ratio = sourceRate / 8000;
  const nextLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(nextLength);
  let outputIndex = 0;
  let inputIndex = 0;
  while (outputIndex < nextLength) {
    const nextInputIndex = Math.min(input.length, Math.round((outputIndex + 1) * ratio));
    let total = 0;
    let count = 0;
    for (let cursor = inputIndex; cursor < nextInputIndex; cursor += 1) {
      total += input[cursor];
      count += 1;
    }
    output[outputIndex] = count > 0 ? total / count : 0;
    outputIndex += 1;
    inputIndex = nextInputIndex;
  }
  return output;
}

function floatToPcm16(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] || 0));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function pcmBytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function encodeMuLawSample(sample: number) {
  const MU_LAW_MAX = 0x1fff;
  const MU_LAW_BIAS = 33;

  let pcm = sample;
  let sign = 0;
  if (pcm < 0) {
    pcm = -pcm;
    sign = 0x80;
  }

  pcm = Math.min(pcm, MU_LAW_MAX);
  pcm += MU_LAW_BIAS;

  let exponent = 7;
  for (let expMask = 0x4000; (pcm & expMask) === 0 && exponent > 0; expMask >>= 1) {
    exponent -= 1;
  }
  const mantissa = (pcm >> (exponent + 3)) & 0x0f;
  return (~(sign | (exponent << 4) | mantissa)) & 0xff;
}

function encodeALawSample(sample: number) {
  const ALAW_MAX = 0x7fff;
  let pcm = Math.max(-ALAW_MAX, Math.min(ALAW_MAX, sample));
  let sign = 0;
  if (pcm < 0) {
    pcm = -pcm - 1;
    sign = 0x80;
  }

  let exponent = 7;
  for (let expMask = 0x4000; (pcm & expMask) === 0 && exponent > 0; expMask >>= 1) {
    exponent -= 1;
  }

  let mantissa: number;
  if (exponent === 0) {
    mantissa = (pcm >> 4) & 0x0f;
  } else {
    mantissa = (pcm >> (exponent + 3)) & 0x0f;
  }

  const encoded = sign | (exponent << 4) | mantissa;
  return (encoded ^ 0x55) & 0xff;
}

function encodeG711(pcm16: Int16Array, format: "g711a" | "g711u") {
  const output = new Uint8Array(pcm16.length);
  for (let index = 0; index < pcm16.length; index += 1) {
    output[index] = format === "g711a" ? encodeALawSample(pcm16[index]) : encodeMuLawSample(pcm16[index]);
  }
  return output;
}

export function GbVideoPage() {
  const stream = useRequest<any>();
  const talk = useRequest<any>();
  const playback = useRequest<any>();
  const [streamForm, setStreamForm] = useState({ serial: "", code: "", audio: "config", check_outputs: false });
  const [talkForm, setTalkForm] = useState({ serial: "", code: "", format: "pcm" });
  const [playbackForm, setPlaybackForm] = useState({ serial: "", code: "", starttime: "", endtime: "", streamid: "", command: "play", range: "now", scale: 2 });
  const [talkSocketUrl, setTalkSocketUrl] = useState("");
  const [talkConnectionState, setTalkConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [talkLogs, setTalkLogs] = useState<string[]>([]);
  const [manualBase64, setManualBase64] = useState("");
  const [micStreaming, setMicStreaming] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const pushTalkLog = (message: string) => {
    setTalkLogs((prev) => [`${new Date().toLocaleTimeString("zh-CN", { hour12: false })} ${message}`, ...prev].slice(0, 10));
  };

  const stopMicStreaming = async () => {
    processorRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    processorRef.current = null;
    sourceNodeRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setMicStreaming(false);
  };

  const disconnectTalkSocket = async () => {
    await stopMicStreaming();
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, "client closed");
    }
    setTalkConnectionState("idle");
  };

  useEffect(() => {
    return () => {
      void disconnectTalkSocket();
    };
  }, []);

  const latestStreamId = useMemo(() => {
    const value = findFirstByKeys(playback.result?.data?.payload, ["streamid", "streamId", "StreamID"]);
    return value === undefined ? "" : String(value);
  }, [playback.result]);

  const latestRecordTimeRange = useMemo(() => {
    const items = findFirstArray(playback.result?.data?.payload);
    const first = items?.[0];
    const starttime = first ? findFirstByKeys(first, ["starttime", "startTime", "StartTime", "beginTime"]) : undefined;
    const endtime = first ? findFirstByKeys(first, ["endtime", "endTime", "EndTime", "stopTime"]) : undefined;
    return {
      starttime: starttime === undefined ? "" : String(starttime),
      endtime: endtime === undefined ? "" : String(endtime),
    };
  }, [playback.result]);

  const playbackPreviewItems = useMemo(() => {
    const items = findArrayByObjectKeys(playback.result?.data?.payload, ["starttime", "startTime", "StartTime", "streamid", "streamId", "StreamID", "fileid", "FilePath"]).slice(0, 3);
    return items.map((item, index) => {
      const start = findFirstByKeys(item, ["starttime", "startTime", "StartTime", "beginTime"]);
      const end = findFirstByKeys(item, ["endtime", "endTime", "EndTime", "stopTime"]);
      const streamid = findFirstByKeys(item, ["streamid", "streamId", "StreamID"]);
      const filePath = findFirstByKeys(item, ["FilePath", "filePath"]);
      return {
        id: `${streamid || filePath || start || index}`,
        title: streamid ? `streamid: ${String(streamid)}` : filePath ? String(filePath) : `录像片段 ${index + 1}`,
        meta: [start ? `开始 ${String(start)}` : null, end ? `结束 ${String(end)}` : null].filter(Boolean).join(" | "),
        action: streamid ? <QuickFillButton onClick={() => setPlaybackForm((prev) => ({ ...prev, streamid: String(streamid) }))}>带入回放</QuickFillButton> : undefined,
      };
    });
  }, [playback.result]);

  const talkPayload = talk.result?.data?.payload as Record<string, unknown> | undefined;
  const helperRelayPath = typeof talkPayload?.helperRelayPath === "string" ? talkPayload.helperRelayPath : "";
  const resolvedTalkSocketUrl = talkSocketUrl || (helperRelayPath ? buildWebSocketUrl(helperRelayPath) : "");

  useEffect(() => {
    if (!streamForm.serial && !streamForm.code) return;
    setTalkForm((prev) => ({
      ...prev,
      serial: prev.serial || streamForm.serial,
      code: prev.code || streamForm.code,
    }));
    setPlaybackForm((prev) => ({
      ...prev,
      serial: prev.serial || streamForm.serial,
      code: prev.code || streamForm.code,
    }));
  }, [streamForm.serial, streamForm.code]);

  useEffect(() => {
    if (!latestStreamId) return;
    setPlaybackForm((prev) => ({ ...prev, streamid: latestStreamId }));
  }, [latestStreamId]);

  useEffect(() => {
    if (!latestRecordTimeRange.starttime && !latestRecordTimeRange.endtime) return;
    setPlaybackForm((prev) => ({
      ...prev,
      starttime: latestRecordTimeRange.starttime || prev.starttime,
      endtime: latestRecordTimeRange.endtime || prev.endtime,
    }));
  }, [latestRecordTimeRange]);

  useEffect(() => {
    if (!helperRelayPath) return;
    setTalkSocketUrl(buildWebSocketUrl(helperRelayPath));
  }, [helperRelayPath]);

  const connectTalkSocket = async () => {
    if (!resolvedTalkSocketUrl) {
      pushTalkLog("未拿到 relay 地址，请先生成语音喊话地址");
      setTalkConnectionState("error");
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      pushTalkLog("WebSocket 已连接");
      return;
    }

    await stopMicStreaming();
    setTalkConnectionState("connecting");
    pushTalkLog("正在连接本地 relay WebSocket...");

    const socket = new WebSocket(resolvedTalkSocketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setTalkConnectionState("connected");
      pushTalkLog("语音喊话 WebSocket 已连接");
    };
    socket.onclose = (event) => {
      setTalkConnectionState("idle");
      setMicStreaming(false);
      pushTalkLog(`连接已关闭 (${event.code}${event.reason ? ` / ${event.reason}` : ""})`);
    };
    socket.onerror = () => {
      setTalkConnectionState("error");
      setMicStreaming(false);
      pushTalkLog("WebSocket 连接异常");
    };
    socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        pushTalkLog(`服务端消息: ${event.data.slice(0, 120)}`);
      } else {
        pushTalkLog("收到二进制响应帧");
      }
    };
  };

  const sendManualBase64 = () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      pushTalkLog("未连接 WebSocket，无法发送音频帧");
      return;
    }
    if (!manualBase64.trim()) {
      pushTalkLog("请输入 Base64 音频数据");
      return;
    }
    socket.send(manualBase64.trim());
    pushTalkLog(`已发送手工 Base64 音频帧 (${manualBase64.trim().length} chars)`);
  };

  const startMicStreaming = async () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      pushTalkLog("请先连接 WebSocket relay");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 8000, echoCancellation: true, noiseSuppression: true } });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);

      processor.onaudioprocess = (event) => {
        const activeSocket = socketRef.current;
        if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) return;
        const channelData = event.inputBuffer.getChannelData(0);
        const downsampled = downsampleTo8k(channelData, audioContext.sampleRate);
        const pcm16 = floatToPcm16(downsampled);
        if (talkForm.format === "pcm") {
          activeSocket.send(pcm16ToBase64(pcm16));
          return;
        }

        if (talkForm.format === "g711a" || talkForm.format === "g711u") {
          activeSocket.send(pcmBytesToBase64(encodeG711(pcm16, talkForm.format)));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      streamRef.current = mediaStream;
      audioContextRef.current = audioContext;
      sourceNodeRef.current = source;
      processorRef.current = processor;
      setMicStreaming(true);
      pushTalkLog(`已开始麦克风 ${talkForm.format.toUpperCase()} 推流（8k / 单声道 / Base64）`);
    } catch (error) {
      pushTalkLog(error instanceof Error ? `麦克风启动失败: ${error.message}` : "麦克风启动失败");
      setMicStreaming(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">国标视频</h1>
          <div className="page-subtitle">覆盖直播、停止、录像查询与回放控制；语音喊话当前提供 websocket 地址生成与参数组织，实际媒体推流仍需前端客户端接入。</div>
        </div>
        <div className="badge-row"><StatusBadge label="GB28181 主链路已接通" color="#059669" background="rgba(16,185,129,0.1)" /></div>
      </div>

      <div className="split-two">
        <SectionCard title="直播与语音喊话" icon={<Video size={18} color="#10b981" />}>
          <div className="stack-16">
            <HintPanel title="前端如何使用" tone="info">
              “开始直播”会让后端代理国标开流接口；“生成语音喊话地址”会返回 relay 信息，当前页面已经能自动带入 WebSocket 地址并直接发起浏览器端音频喊话。
            </HintPanel>
            <div className="grid-2">
              <Field label="serial"><input className="input" value={streamForm.serial} onChange={(e) => setStreamForm({ ...streamForm, serial: e.target.value })} /></Field>
              <Field label="code"><input className="input" value={streamForm.code} onChange={(e) => setStreamForm({ ...streamForm, code: e.target.value })} /></Field>
            </div>
            <Field label="audio / check_outputs"><input className="input" value={streamForm.audio} onChange={(e) => setStreamForm({ ...streamForm, audio: e.target.value })} placeholder="config / true / false" /></Field>
            <div className="badge-row">
              <PrimaryButton loading={stream.loading} onClick={() => stream.run(() => api.get(`/api/v1/stream/start${buildQuery({ serial: streamForm.serial, code: streamForm.code, audio: streamForm.audio })}`))}><Play size={16} />开始直播</PrimaryButton>
              <button className="button button-danger" onClick={() => stream.run(() => api.get(`/api/v1/stream/stop${buildQuery({ serial: streamForm.serial, code: streamForm.code, check_outputs: streamForm.check_outputs })}`))}><StopCircle size={16} />停止直播</button>
              <QuickFillButton onClick={() => setTalkForm((prev) => ({ ...prev, serial: streamForm.serial, code: streamForm.code }))}>直播参数带入喊话</QuickFillButton>
            </div>
            <div className="grid-2">
              <Field label="喊话 serial"><input className="input" value={talkForm.serial} onChange={(e) => setTalkForm({ ...talkForm, serial: e.target.value })} /></Field>
              <Field label="喊话 code"><input className="input" value={talkForm.code} onChange={(e) => setTalkForm({ ...talkForm, code: e.target.value })} /></Field>
            </div>
            <Field label="format" hint="这里的格式要和后续 websocket 推流编码保持一致。"><select className="select" value={talkForm.format} onChange={(e) => setTalkForm({ ...talkForm, format: e.target.value })}><option value="pcm">pcm</option><option value="g711a">g711a</option><option value="g711u">g711u</option></select></Field>
            <PrimaryButton loading={talk.loading} onClick={() => talk.run(() => api.get(`/api/v1/control/ws-talk-url${buildQuery(talkForm)}`))}><Radio size={16} />生成语音喊话地址</PrimaryButton>
            <ResultSummary
              title="直播 / 喊话摘要"
              items={[
                { label: "直播 serial", value: streamForm.serial, action: streamForm.serial ? <QuickFillButton onClick={() => setTalkForm((prev) => ({ ...prev, serial: streamForm.serial }))}>带入喊话</QuickFillButton> : null },
                { label: "直播 code", value: streamForm.code, action: streamForm.code ? <QuickFillButton onClick={() => setTalkForm((prev) => ({ ...prev, code: streamForm.code }))}>带入喊话</QuickFillButton> : null },
                { label: "喊话格式", value: talkForm.format },
              ]}
            />
            <HintPanel title="WebSocket 语音喊话测试" tone="info">
              文档要求发送经过 Base64 编码的音频数据，8000 采样率、单通道。下面已经接上本地 relay WebSocket，浏览器现在可按 `pcm`、`g711a`、`g711u` 三种 format 直接采集麦克风并推流。
            </HintPanel>
            <Field label="relay WebSocket URL" hint="默认优先使用后端 helperRelayPath 自动转换出的本地 ws 地址，也可以手工覆盖。"><input className="input" value={resolvedTalkSocketUrl} onChange={(e) => setTalkSocketUrl(e.target.value)} placeholder="ws://localhost:8080/ws/talk-relay?..." /></Field>
            <div className="badge-row">
              <StatusBadge label={talkConnectionState === "connected" ? "已连接" : talkConnectionState === "connecting" ? "连接中" : talkConnectionState === "error" ? "连接异常" : "未连接"} color={talkConnectionState === "connected" ? "#059669" : talkConnectionState === "connecting" ? "#d97706" : talkConnectionState === "error" ? "#dc2626" : "#64748b"} background={talkConnectionState === "connected" ? "rgba(16,185,129,0.1)" : talkConnectionState === "connecting" ? "rgba(245,158,11,0.1)" : talkConnectionState === "error" ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.12)"} />
              <PrimaryButton onClick={connectTalkSocket} disabled={!resolvedTalkSocketUrl || talkConnectionState === "connecting"}><PlugZap size={16} />连接 relay</PrimaryButton>
              <button className="button button-danger" onClick={() => void disconnectTalkSocket()}><MicOff size={16} />断开</button>
              <PrimaryButton onClick={startMicStreaming} disabled={talkConnectionState !== "connected" || micStreaming}><Mic size={16} />开始麦克风推流</PrimaryButton>
              <button className="button button-secondary" onClick={() => void stopMicStreaming()} disabled={!micStreaming}>停止推流</button>
            </div>
            <Field label="手工 Base64 音频帧" hint="适合粘贴单帧 Base64 音频数据做联调；点击发送后会直接通过 websocket text frame 发出。"><textarea className="textarea" value={manualBase64} onChange={(e) => setManualBase64(e.target.value)} placeholder="粘贴 Base64 编码后的 PCM / G711 音频帧" /></Field>
            <div className="badge-row">
              <PrimaryButton onClick={sendManualBase64} disabled={talkConnectionState !== "connected"}><Radio size={16} />发送 Base64 帧</PrimaryButton>
              {helperRelayPath ? <QuickFillButton onClick={() => setTalkSocketUrl(buildWebSocketUrl(helperRelayPath))}>使用 helperRelayPath</QuickFillButton> : null}
            </div>
            <ResultPreviewList
              title="最近喊话状态"
              items={talkLogs.map((item, index) => ({
                id: `${index}-${item}`,
                title: item,
              }))}
            />
            <ResultPanel result={talk.result || stream.result} />
          </div>
        </SectionCard>

        <SectionCard title="录像与回放" icon={<Play size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <HintPanel title="推荐流程" tone="info">
              先查录像列表或直接开始回放，拿到返回里的 `streamid` 后再执行暂停、继续、倍速、停止和流信息查询。当前页面仍以接口调试为主，没有嵌入播放器。
            </HintPanel>
            <div className="grid-2">
              <Field label="serial"><input className="input" value={playbackForm.serial} onChange={(e) => setPlaybackForm({ ...playbackForm, serial: e.target.value })} /></Field>
              <Field label="code"><input className="input" value={playbackForm.code} onChange={(e) => setPlaybackForm({ ...playbackForm, code: e.target.value })} /></Field>
            </div>
            <div className="grid-2">
              <Field label="starttime" hint="使用日期时间选择器，提交时自动补成接口需要的秒级时间字符串。"><input className="input" type="datetime-local" value={toDatetimeLocalValue(playbackForm.starttime)} onChange={(e) => setPlaybackForm({ ...playbackForm, starttime: e.target.value })} /></Field>
              <Field label="endtime"><input className="input" type="datetime-local" value={toDatetimeLocalValue(playbackForm.endtime)} onChange={(e) => setPlaybackForm({ ...playbackForm, endtime: e.target.value })} /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/recordlist${buildQuery({ serial: playbackForm.serial, code: playbackForm.code, starttime: fromDatetimeLocalValue(playbackForm.starttime), endtime: fromDatetimeLocalValue(playbackForm.endtime) })}`))}>查询录像列表</PrimaryButton>
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/start${buildQuery({ serial: playbackForm.serial, code: playbackForm.code, starttime: fromDatetimeLocalValue(playbackForm.starttime), endtime: fromDatetimeLocalValue(playbackForm.endtime) })}`))}>开始回放</PrimaryButton>
              <QuickFillButton onClick={() => setPlaybackForm((prev) => ({ ...prev, serial: streamForm.serial, code: streamForm.code }))}>直播参数带入回放</QuickFillButton>
            </div>
            {latestRecordTimeRange.starttime || latestRecordTimeRange.endtime ? <div className="badge-row"><QuickFillButton onClick={() => setPlaybackForm((prev) => ({ ...prev, starttime: latestRecordTimeRange.starttime || prev.starttime, endtime: latestRecordTimeRange.endtime || prev.endtime }))}>使用最近录像时间段</QuickFillButton></div> : null}
            <Field label="streamid" hint="开始回放成功后，可直接使用下面的快捷按钮带入最近 streamid。"><input className="input" value={playbackForm.streamid} onChange={(e) => setPlaybackForm({ ...playbackForm, streamid: e.target.value })} /></Field>
            {latestStreamId ? <div className="badge-row"><QuickFillButton onClick={() => setPlaybackForm((prev) => ({ ...prev, streamid: latestStreamId }))}>使用最近 streamid：{latestStreamId}</QuickFillButton></div> : null}
            <div className="grid-2">
              <Field label="command"><select className="select" value={playbackForm.command} onChange={(e) => setPlaybackForm({ ...playbackForm, command: e.target.value })}><option value="play">play</option><option value="pause">pause</option><option value="teardown">teardown</option><option value="scale">scale</option></select></Field>
              <Field label="range / scale"><input className="input" value={playbackForm.command === "scale" ? String(playbackForm.scale) : playbackForm.range} onChange={(e) => playbackForm.command === "scale" ? setPlaybackForm({ ...playbackForm, scale: Number(e.target.value) || 1 }) : setPlaybackForm({ ...playbackForm, range: e.target.value })} /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/control${buildQuery({ streamid: playbackForm.streamid, command: playbackForm.command, range: playbackForm.range, scale: playbackForm.scale })}`))}>回放控制</PrimaryButton>
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/streaminfo${buildQuery({ streamid: playbackForm.streamid })}`))}>查询流信息</PrimaryButton>
              <button className="button button-danger" onClick={() => playback.run(() => api.get(`/api/v1/playback/stop${buildQuery({ streamid: playbackForm.streamid })}`))}>停止回放</button>
            </div>
            <ResultSummary
              title="回放摘要"
              items={[
                { label: "streamid", value: latestStreamId || playbackForm.streamid, action: latestStreamId ? <QuickFillButton onClick={() => setPlaybackForm((prev) => ({ ...prev, streamid: latestStreamId }))}>带入控制</QuickFillButton> : null },
                { label: "最近开始时间", value: latestRecordTimeRange.starttime, action: latestRecordTimeRange.starttime ? <QuickFillButton onClick={() => setPlaybackForm((prev) => ({ ...prev, starttime: latestRecordTimeRange.starttime }))}>带入开始</QuickFillButton> : null },
                { label: "最近结束时间", value: latestRecordTimeRange.endtime, action: latestRecordTimeRange.endtime ? <QuickFillButton onClick={() => setPlaybackForm((prev) => ({ ...prev, endtime: latestRecordTimeRange.endtime }))}>带入结束</QuickFillButton> : null },
              ]}
            />
            <ResultPreviewList title="最近录像片段" items={playbackPreviewItems} />
            <ResultPanel result={playback.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
