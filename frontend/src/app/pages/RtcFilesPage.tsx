import { Download, HardDriveDownload, RadioTower, SearchCheck } from "lucide-react";
import { Field, HintPanel, JsonErrorNotice, PrimaryButton, QuickFillButton, ResultPanel, ResultPreviewList, ResultSummary, SectionCard, StatusBadge } from "@/app/components/common";
import { api, buildDownloadUrl } from "@/app/lib/api";
import { findArrayByObjectKeys, findFirstByKeys, parseJsonInput, toPuid } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useEffect, useMemo, useState } from "react";

export function RtcFilesPage() {
  const puInfo = useRequest<any>();
  const dialogs = useRequest<any>();
  const files = useRequest<any>();
  const [deviceId, setDeviceId] = useState("31011500991323310018");
  const puid = useMemo(() => toPuid(deviceId), [deviceId]);
  const [dialogPayload, setDialogPayload] = useState(`{"id":"${puid}","index":1,"sdp":"v=0..."}`);
  const [dialogId, setDialogId] = useState("");
  const [platformFilePayload, setPlatformFilePayload] = useState('{"page":0,"pageSize":10,"filter":{"fileType":["video"]}}');
  const [deviceFilePayload, setDeviceFilePayload] = useState('{"page":0,"pageSize":10,"filter":{"channelIndex":1,"fileType":["video"]}}');
  const [downloadInfo, setDownloadInfo] = useState({ fileid: "", puid: "" });

  const dialogJson = useMemo(() => parseJsonInput(dialogPayload), [dialogPayload]);
  const platformJson = useMemo(() => parseJsonInput(platformFilePayload), [platformFilePayload]);
  const deviceJson = useMemo(() => parseJsonInput(deviceFilePayload), [deviceFilePayload]);

  const latestDialogId = useMemo(() => {
    const value = findFirstByKeys(dialogs.result?.data?.payload, ["dialogid", "dialogId"]);
    return value === undefined ? "" : String(value);
  }, [dialogs.result]);

  const latestFileId = useMemo(() => {
    const value = findFirstByKeys(files.result?.data?.payload, ["fileid", "fileId", "fileID", "id"]);
    return value === undefined ? "" : String(value);
  }, [files.result]);

  const latestResultPuid = useMemo(() => {
    const value = findFirstByKeys(puInfo.result?.data?.payload ?? files.result?.data?.payload, ["puid", "puID", "id"]);
    return value === undefined ? "" : String(value);
  }, [puInfo.result, files.result]);

  useEffect(() => {
    if (!latestDialogId) return;
    setDialogId(latestDialogId);
  }, [latestDialogId]);

  useEffect(() => {
    if (!latestFileId) return;
    setDownloadInfo((prev) => ({ ...prev, fileid: latestFileId }));
  }, [latestFileId]);

  useEffect(() => {
    if (!latestResultPuid) return;
    setDownloadInfo((prev) => ({ ...prev, puid: latestResultPuid }));
  }, [latestResultPuid]);

  useEffect(() => {
    const parsed = parseJsonInput<Record<string, unknown>>(dialogPayload);
    if (!parsed.ok || typeof parsed.data !== "object" || !parsed.data) return;
    if (parsed.data.id === puid) return;
    setDialogPayload(JSON.stringify({ ...parsed.data, id: puid }, null, 2));
  }, [puid]);

  const filePreviewItems = useMemo(() => {
    const items = findArrayByObjectKeys(files.result?.data?.payload, ["fileid", "fileId", "fileID", "path", "filePath"]).slice(0, 4);
    return items.map((item, index) => {
      const fileid = findFirstByKeys(item, ["fileid", "fileId", "fileID", "id"]);
      const path = findFirstByKeys(item, ["path", "filePath"]);
      const fileType = findFirstByKeys(item, ["fileType", "type"]);
      return {
        id: `${fileid || path || index}`,
        title: fileid ? `fileid: ${String(fileid)}` : path ? String(path) : `文件 ${index + 1}`,
        meta: [fileType ? `类型 ${String(fileType)}` : null, path ? `路径 ${String(path)}` : null].filter(Boolean).join(" | "),
        action: fileid ? <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, fileid: String(fileid) }))}>带入下载</QuickFillButton> : undefined,
      };
    });
  }, [files.result]);

  const platformDownloadUrl = buildDownloadUrl(`/bvnru/v1/download/${downloadInfo.fileid}`);
  const deviceDownloadUrl = buildDownloadUrl(`/bvnru/v1/pu/download/${downloadInfo.puid || puid}/${downloadInfo.fileid}`);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">私有 RTC 与文件</h1>
          <div className="page-subtitle">设备信息、webrtc / bvrtc 会话、平台/设备文件检索与下载入口都在这里；当前下载通过后端代理 URL + token 查询参数兜底，不再依赖手工拼接。</div>
        </div>
        <div className="badge-row"><StatusBadge label={`自动推导 ${puid}`} color="#059669" background="rgba(16,185,129,0.1)" /></div>
      </div>

      <div className="split-two">
        <SectionCard title="RTC 实时流" icon={<RadioTower size={18} color="#10b981" />}>
          <div className="stack-16">
            <HintPanel title="前端如何使用" tone="info">
              输入业务设备号后会自动推导 `puid`。推荐顺序是：先查设备信息，再发起 WebRTC/BVRTC，会话建立后把返回的 `dialogid` 填入下面的关闭框；如需真正播流，仍要把返回 SDP 交给浏览器播放器逻辑消费。
            </HintPanel>
            <Field label="设备业务 ID（自动推导 puid）" hint="这里只是便捷推导；如果后端实际 puid 规则不同，需要以后端返回为准。"><input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={puInfo.loading} onClick={() => puInfo.run(() => api.get(`/bvcsp/v1/pu/info/${puid}`))}>获取设备信息</PrimaryButton>
              {latestResultPuid ? <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, puid: latestResultPuid }))}>使用返回 puid</QuickFillButton> : null}
            </div>
            <Field label="打开流 JSON"><textarea className="textarea" value={dialogPayload} onChange={(e) => setDialogPayload(e.target.value)} /></Field>
            <JsonErrorNotice error={dialogJson.ok ? null : dialogJson.error} />
            <div className="badge-row">
              <PrimaryButton loading={dialogs.loading} disabled={!dialogJson.ok} onClick={() => dialogJson.ok && dialogs.run(() => api.post("/bvcsp/v1/dialog/device/webrtc", dialogJson.data))}>打开 WebRTC</PrimaryButton>
              <PrimaryButton loading={dialogs.loading} disabled={!dialogJson.ok} onClick={() => dialogJson.ok && dialogs.run(() => api.post("/bvcsp/v1/dialog/device/bvrtc", dialogJson.data))}>打开 BVRTC</PrimaryButton>
              <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, puid }))}>使用当前推导 puid</QuickFillButton>
            </div>
            <Field label="dialogid" hint="通常来自创建会话结果里的 dialogid 字段。"><input className="input" value={dialogId} onChange={(e) => setDialogId(e.target.value)} /></Field>
            {latestDialogId ? <div className="badge-row"><QuickFillButton onClick={() => setDialogId(latestDialogId)}>使用最近 dialogid：{latestDialogId}</QuickFillButton></div> : null}
            <button className="button button-danger" onClick={() => dialogs.run(() => api.post(`/bvcsp/v1/dialog/close/${dialogId}`))}>关闭会话</button>
            <ResultSummary
              title="RTC 会话摘要"
              items={[
                { label: "当前设备号", value: deviceId },
                { label: "推导 puid", value: puid, action: <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, puid }))}>带入下载</QuickFillButton> },
                { label: "最近 dialogid", value: latestDialogId, action: latestDialogId ? <QuickFillButton onClick={() => setDialogId(latestDialogId)}>带入关闭</QuickFillButton> : null },
              ]}
            />
            <ResultPanel result={dialogs.result || puInfo.result} />
          </div>
        </SectionCard>

        <SectionCard title="平台 / 设备文件检索" icon={<SearchCheck size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <HintPanel title="检索与下载说明" tone="info">
              先用平台或设备检索拿到 `fileid`，再在下面生成下载入口。平台文件下载只需要 `fileid`；设备文件下载同时需要 `puid`，默认会使用上方自动推导值。
            </HintPanel>
            <Field label="平台文件检索 JSON"><textarea className="textarea" value={platformFilePayload} onChange={(e) => setPlatformFilePayload(e.target.value)} /></Field>
            <JsonErrorNotice error={platformJson.ok ? null : platformJson.error} />
            <PrimaryButton loading={files.loading} disabled={!platformJson.ok} onClick={() => platformJson.ok && files.run(() => api.post("/bvcsp/v1/recordfile/filter", platformJson.data))}>平台文件检索</PrimaryButton>
            <Field label="设备文件检索 JSON"><textarea className="textarea" value={deviceFilePayload} onChange={(e) => setDeviceFilePayload(e.target.value)} /></Field>
            <JsonErrorNotice error={deviceJson.ok ? null : deviceJson.error} />
            <PrimaryButton loading={files.loading} disabled={!deviceJson.ok} onClick={() => deviceJson.ok && files.run(() => api.post(`/bvcsp/v1/pu/recordfile/filter/${puid}`, deviceJson.data))}>设备文件检索</PrimaryButton>
            <div className="grid-2">
              <Field label="平台 fileid" hint="来自平台检索或设备检索结果中的文件主键。"><input className="input" value={downloadInfo.fileid} onChange={(e) => setDownloadInfo({ ...downloadInfo, fileid: e.target.value })} /></Field>
              <Field label="设备 puid" hint="留空时默认使用上方设备号推导值。"><input className="input" value={downloadInfo.puid} onChange={(e) => setDownloadInfo({ ...downloadInfo, puid: e.target.value })} placeholder={puid} /></Field>
            </div>
            <div className="badge-row">
              {latestFileId ? <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, fileid: latestFileId }))}>使用最近 fileid：{latestFileId}</QuickFillButton> : null}
              <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, puid }))}>带入当前 puid</QuickFillButton>
              {latestResultPuid ? <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, puid: latestResultPuid }))}>使用返回 puid：{latestResultPuid}</QuickFillButton> : null}
            </div>
            <div className="badge-row">
              <a className="button button-secondary" href={platformDownloadUrl} target="_blank" rel="noreferrer"><Download size={16} />下载平台文件</a>
              <a className="button button-secondary" href={deviceDownloadUrl} target="_blank" rel="noreferrer"><HardDriveDownload size={16} />下载设备文件</a>
            </div>
            <ResultSummary
              title="文件下载摘要"
              items={[
                { label: "最近 fileid", value: latestFileId, action: latestFileId ? <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, fileid: latestFileId }))}>带入下载</QuickFillButton> : null },
                { label: "下载 puid", value: downloadInfo.puid || puid, action: latestResultPuid ? <QuickFillButton onClick={() => setDownloadInfo((prev) => ({ ...prev, puid: latestResultPuid }))}>使用返回 puid</QuickFillButton> : null },
                { label: "平台下载 URL", value: downloadInfo.fileid ? platformDownloadUrl : "" },
              ]}
            />
            <ResultPreviewList title="最近文件结果" items={filePreviewItems} />
            <HintPanel tone="warn" title="已知限制">
              当前下载入口优先使用 `_token` 查询参数兼容鉴权；如果上游下载接口最终只接受请求头而不接受查询参数，下一步仍建议补一个后端下载中转 helper。
            </HintPanel>
            <ResultPanel result={files.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
