import { Play, Radio, StopCircle, Video } from "lucide-react";
import { Field, PrimaryButton, ResultPanel, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useState } from "react";

export function GbVideoPage() {
  const stream = useRequest<any>();
  const talk = useRequest<any>();
  const playback = useRequest<any>();
  const [streamForm, setStreamForm] = useState({ serial: "", code: "", audio: "config", check_outputs: false });
  const [talkForm, setTalkForm] = useState({ serial: "", code: "", format: "pcm" });
  const [playbackForm, setPlaybackForm] = useState({ serial: "", code: "", starttime: "", endtime: "", streamid: "", command: "play", range: "now", scale: 2 });

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">国标视频</h1>
          <div className="page-subtitle">完整覆盖直播、停止、语音喊话地址生成、录像列表、回放开始/停止/控制/进度查询。</div>
        </div>
        <div className="badge-row"><StatusBadge label="GB28181 全链路" color="#059669" background="rgba(16,185,129,0.1)" /></div>
      </div>

      <div className="split-two">
        <SectionCard title="直播与语音喊话" icon={<Video size={18} color="#10b981" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="serial"><input className="input" value={streamForm.serial} onChange={(e) => setStreamForm({ ...streamForm, serial: e.target.value })} /></Field>
              <Field label="code"><input className="input" value={streamForm.code} onChange={(e) => setStreamForm({ ...streamForm, code: e.target.value })} /></Field>
            </div>
            <Field label="audio / check_outputs"><input className="input" value={streamForm.audio} onChange={(e) => setStreamForm({ ...streamForm, audio: e.target.value })} placeholder="config / true / false" /></Field>
            <div className="badge-row">
              <PrimaryButton loading={stream.loading} onClick={() => stream.run(() => api.get(`/api/v1/stream/start${buildQuery({ serial: streamForm.serial, code: streamForm.code, audio: streamForm.audio })}`))}><Play size={16} />开始直播</PrimaryButton>
              <button className="button button-danger" onClick={() => stream.run(() => api.get(`/api/v1/stream/stop${buildQuery({ serial: streamForm.serial, code: streamForm.code, check_outputs: streamForm.check_outputs })}`))}><StopCircle size={16} />停止直播</button>
            </div>
            <div className="grid-2">
              <Field label="喊话 serial"><input className="input" value={talkForm.serial} onChange={(e) => setTalkForm({ ...talkForm, serial: e.target.value })} /></Field>
              <Field label="喊话 code"><input className="input" value={talkForm.code} onChange={(e) => setTalkForm({ ...talkForm, code: e.target.value })} /></Field>
            </div>
            <Field label="format"><select className="select" value={talkForm.format} onChange={(e) => setTalkForm({ ...talkForm, format: e.target.value })}><option value="pcm">pcm</option><option value="g711a">g711a</option><option value="g711u">g711u</option></select></Field>
            <PrimaryButton loading={talk.loading} onClick={() => talk.run(() => api.get(`/api/v1/control/ws-talk-url${buildQuery(talkForm)}`))}><Radio size={16} />生成语音喊话地址</PrimaryButton>
            <ResultPanel result={talk.result || stream.result} />
          </div>
        </SectionCard>

        <SectionCard title="录像与回放" icon={<Play size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="serial"><input className="input" value={playbackForm.serial} onChange={(e) => setPlaybackForm({ ...playbackForm, serial: e.target.value })} /></Field>
              <Field label="code"><input className="input" value={playbackForm.code} onChange={(e) => setPlaybackForm({ ...playbackForm, code: e.target.value })} /></Field>
            </div>
            <div className="grid-2">
              <Field label="starttime"><input className="input" value={playbackForm.starttime} onChange={(e) => setPlaybackForm({ ...playbackForm, starttime: e.target.value })} placeholder="2024-04-25T08:00:00" /></Field>
              <Field label="endtime"><input className="input" value={playbackForm.endtime} onChange={(e) => setPlaybackForm({ ...playbackForm, endtime: e.target.value })} placeholder="2024-04-25T09:00:00" /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/recordlist${buildQuery({ serial: playbackForm.serial, code: playbackForm.code, starttime: playbackForm.starttime, endtime: playbackForm.endtime })}`))}>查询录像列表</PrimaryButton>
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/start${buildQuery({ serial: playbackForm.serial, code: playbackForm.code, starttime: playbackForm.starttime, endtime: playbackForm.endtime })}`))}>开始回放</PrimaryButton>
            </div>
            <Field label="streamid"><input className="input" value={playbackForm.streamid} onChange={(e) => setPlaybackForm({ ...playbackForm, streamid: e.target.value })} /></Field>
            <div className="grid-2">
              <Field label="command"><select className="select" value={playbackForm.command} onChange={(e) => setPlaybackForm({ ...playbackForm, command: e.target.value })}><option value="play">play</option><option value="pause">pause</option><option value="teardown">teardown</option><option value="scale">scale</option></select></Field>
              <Field label="range / scale"><input className="input" value={playbackForm.command === "scale" ? String(playbackForm.scale) : playbackForm.range} onChange={(e) => playbackForm.command === "scale" ? setPlaybackForm({ ...playbackForm, scale: Number(e.target.value) || 1 }) : setPlaybackForm({ ...playbackForm, range: e.target.value })} /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/control${buildQuery({ streamid: playbackForm.streamid, command: playbackForm.command, range: playbackForm.range, scale: playbackForm.scale })}`))}>回放控制</PrimaryButton>
              <PrimaryButton loading={playback.loading} onClick={() => playback.run(() => api.get(`/api/v1/playback/streaminfo${buildQuery({ streamid: playbackForm.streamid })}`))}>查询流信息</PrimaryButton>
              <button className="button button-danger" onClick={() => playback.run(() => api.get(`/api/v1/playback/stop${buildQuery({ streamid: playbackForm.streamid })}`))}>停止回放</button>
            </div>
            <ResultPanel result={playback.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
