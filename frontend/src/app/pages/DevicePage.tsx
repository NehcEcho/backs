import { useEffect, useMemo, useState } from "react";
import { Cpu, FileSearch, MapPinned, Pencil, Search, Trash2 } from "lucide-react";
import { CompactTable, Field, HintPanel, PrimaryButton, QuickFillButton, ResultPanel, ResultPreviewList, ResultSummary, SectionCard, SecondaryButton, StatCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery, findArrayByObjectKeys, findFirstArray, findFirstByKeys, toDateInputValue, toDatetimeLocalValue, toPuid, toUnixSecondsFromDatetimeLocal } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";

export function DevicePage() {
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const devices = useRequest<any>();
  const deviceDetail = useRequest<any>();
  const deviceGroups = useRequest<any>();
  const updateDevice = useRequest<any>();
  const deviceFiles = useRequest<any>();
  const deleteFile = useRequest<any>();
  const locations = useRequest<any>();

  const [listForm, setListForm] = useState({ is_page: true, page_index: 1, page_size: 10, device_id: "", device_name: "", company_id: "", company_name: "" });
  const [deviceId, setDeviceId] = useState("1");
  const [deviceUpdate, setDeviceUpdate] = useState({ id: "1", deviceName: "", productId: "" });
  const [fileForm, setFileForm] = useState({ type: "photo", device_id: "", date: todayDate });
  const [deletePath, setDeletePath] = useState("");
  const [locationForm, setLocationForm] = useState({ device_id: "", levels: "1,2,3,4", start_time: "", end_time: "" });

  const stats = useMemo(
    () => [
      { label: "设备查询能力", value: "4 类", trend: "分组 / 列表 / 详情 / 更新", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <Cpu size={20} color="#10b981" /> },
      { label: "文件能力", value: "已接通", trend: "查询与删除", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <FileSearch size={20} color="#3b82f6" /> },
      { label: "轨迹能力", value: "已接通", trend: "时间范围 + 精度过滤", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <MapPinned size={20} color="#f59e0b" /> },
      { label: "RTC 辅助字段", value: toPuid(fileForm.device_id || "31011500991323310018"), trend: "设备 ID 可快速转 puid", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <Pencil size={20} color="#8b5cf6" /> },
    ],
    [fileForm.device_id],
  );

  const latestDevicePayload = deviceGroups.result?.data?.payload ?? devices.result?.data?.payload ?? deviceDetail.result?.data?.payload;
  const latestDeviceId = useMemo(() => {
    const value = findFirstByKeys(latestDevicePayload, ["id", "deviceId"]);
    return value === undefined ? "" : String(value);
  }, [latestDevicePayload]);

  const latestBusinessDeviceId = useMemo(() => {
    const value = findFirstByKeys(latestDevicePayload, ["device_id", "deviceId", "sn", "serial"]);
    return value === undefined ? "" : String(value);
  }, [latestDevicePayload]);

  const latestFilePath = useMemo(() => {
    const value = findFirstByKeys(deviceFiles.result?.data?.payload, ["path", "filePath"]);
    return value === undefined ? "" : String(value);
  }, [deviceFiles.result]);

  const latestFileDate = useMemo(() => {
    const value = findFirstByKeys(deviceFiles.result?.data?.payload, ["lastModified", "date", "createTime", "uploadTime"]);
    return value === undefined ? "" : toDateInputValue(value);
  }, [deviceFiles.result]);

  const latestLocationDeviceId = useMemo(() => {
    const items = findFirstArray(locations.result?.data?.payload);
    const value = items ? findFirstByKeys(items[0], ["device_id", "deviceId"]) : undefined;
    return value === undefined ? "" : String(value);
  }, [locations.result]);

  const latestLocationTimeRange = useMemo(() => {
    const items = findFirstArray(locations.result?.data?.payload);
    const first = items?.[0];
    const last = items?.[items.length - 1];
    const start = first ? findFirstByKeys(first, ["time", "gpsTime", "createTime"]) : undefined;
    const end = last ? findFirstByKeys(last, ["time", "gpsTime", "createTime"]) : undefined;
    return {
      start_time: start === undefined ? "" : String(start),
      end_time: end === undefined ? "" : String(end),
    };
  }, [locations.result]);

  const filePreviewItems = useMemo(() => {
    const items = findArrayByObjectKeys(deviceFiles.result?.data?.payload, ["path", "filePath", "type"]).slice(0, 4);
    return items.map((item, index) => {
      const path = findFirstByKeys(item, ["path", "filePath"]);
      const type = findFirstByKeys(item, ["type", "fileType"]);
      const date = findFirstByKeys(item, ["lastModified", "date", "createTime", "uploadTime"]);
      const name = findFirstByKeys(item, ["name", "fileName"]);
      return {
        id: `${path || index}`,
        title: name ? String(name) : path ? String(path) : `文件 ${index + 1}`,
        meta: [type ? `类型 ${String(type)}` : null, date ? `时间 ${String(date)}` : null].filter(Boolean).join(" | "),
        action: path ? <QuickFillButton onClick={() => setDeletePath(String(path))}>带入删除</QuickFillButton> : undefined,
      };
    });
  }, [deviceFiles.result]);

  const photoPreviewItems = useMemo(() => {
    if (fileForm.type !== "photo") return [];
    const items = findArrayByObjectKeys(deviceFiles.result?.data?.payload, ["presignedURL", "path", "filePath", "name"]).slice(0, 8);
    return items
      .map((item, index) => {
        const url = findFirstByKeys(item, ["presignedURL", "url"]);
        if (!url) return null;
        const path = findFirstByKeys(item, ["path", "filePath"]);
        const name = findFirstByKeys(item, ["name", "fileName"]);
        const time = findFirstByKeys(item, ["lastModified", "date", "createTime", "uploadTime"]);
        return {
          id: `${path || name || index}`,
          url: String(url),
          title: name ? String(name) : path ? String(path) : `图片 ${index + 1}`,
          meta: time ? String(time) : "",
          path: path ? String(path) : "",
        };
      })
      .filter((item): item is { id: string; url: string; title: string; meta: string; path: string } => Boolean(item));
  }, [deviceFiles.result, fileForm.type]);

  const locationPreviewItems = useMemo(() => {
    const items = findArrayByObjectKeys(locations.result?.data?.payload, ["longitude", "latitude", "device_id", "deviceId"]).slice(0, 4);
    return items.map((item, index) => {
      const device = findFirstByKeys(item, ["device_id", "deviceId"]);
      const longitude = findFirstByKeys(item, ["longitude", "lng"]);
      const latitude = findFirstByKeys(item, ["latitude", "lat"]);
      const time = findFirstByKeys(item, ["time", "gpsTime", "createTime"]);
      return {
        id: `${device || longitude || index}`,
        title: device ? `设备 ${String(device)}` : `轨迹点 ${index + 1}`,
        meta: [longitude !== undefined && latitude !== undefined ? `坐标 ${String(longitude)}, ${String(latitude)}` : null, time ? `时间 ${String(time)}` : null].filter(Boolean).join(" | "),
        action: device ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, device_id: String(device) }))}>带入查询</QuickFillButton> : undefined,
      };
    });
  }, [locations.result]);

  const deviceRows = useMemo(() => {
    return findArrayByObjectKeys(latestDevicePayload, ["id", "device_id", "deviceName", "status"]).slice(0, 5).map((item) => {
      const id = findFirstByKeys(item, ["id", "deviceId"]);
      const bizId = findFirstByKeys(item, ["device_id", "deviceId", "sn", "serial"]);
      const name = findFirstByKeys(item, ["deviceName", "name"]);
      const status = findFirstByKeys(item, ["status"]);
      return [
        String(id ?? "-"),
        String(bizId ?? "-"),
        String(name ?? "-"),
        String(status ?? "-"),
        id ? <QuickFillButton onClick={() => setDeviceId(String(id))}>详情</QuickFillButton> : "-",
      ];
    });
  }, [latestDevicePayload]);

  useEffect(() => {
    if (!latestDeviceId) return;
    setDeviceId(latestDeviceId);
    setDeviceUpdate((prev) => ({ ...prev, id: latestDeviceId }));
  }, [latestDeviceId]);

  useEffect(() => {
    if (!latestBusinessDeviceId) return;
    setListForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }));
    setFileForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }));
    setLocationForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }));
  }, [latestBusinessDeviceId]);

  useEffect(() => {
    if (!latestFilePath) return;
    setDeletePath(latestFilePath);
  }, [latestFilePath]);

  useEffect(() => {
    if (!latestFileDate) return;
    setFileForm((prev) => ({ ...prev, date: latestFileDate }));
  }, [latestFileDate]);

  useEffect(() => {
    if (!latestLocationDeviceId) return;
    setLocationForm((prev) => ({ ...prev, device_id: latestLocationDeviceId }));
  }, [latestLocationDeviceId]);

  useEffect(() => {
    if (!latestLocationTimeRange.start_time && !latestLocationTimeRange.end_time) return;
    setLocationForm((prev) => ({
      ...prev,
      start_time: latestLocationTimeRange.start_time || prev.start_time,
      end_time: latestLocationTimeRange.end_time || prev.end_time,
    }));
  }, [latestLocationTimeRange]);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">设备管理</h1>
          <div className="page-subtitle">覆盖高频设备 REST 能力：分组、列表、详情、更新、文件检索/删除、历史轨迹；语音 websocket 与 RTC 下载仍在其他页面配合使用。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="设备 REST 主流程已接通" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">{stats.map((item) => <StatCard key={item.label} {...item} />)}</div>

      <div className="split-two">
        <SectionCard title="设备分组与列表" icon={<Search size={18} color="#10b981" />}>
          <div className="stack-16">
            <HintPanel title="使用说明" tone="info">
              这里对应后端代理的设备查询接口。先点“获取用户设备分组”确认当前账号可见范围，再按设备 ID、名称或公司字段缩小结果，避免直接全量翻页检索。
            </HintPanel>
            <div className="badge-row">
              <PrimaryButton loading={deviceGroups.loading} onClick={() => deviceGroups.run(() => api.get("/v1/user/devices"))}>获取用户设备分组</PrimaryButton>
              {latestDeviceId ? <QuickFillButton onClick={() => setDeviceId(latestDeviceId)}>带入详情 ID</QuickFillButton> : null}
              {latestBusinessDeviceId ? <QuickFillButton onClick={() => {
                setFileForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }));
                setLocationForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }));
              }}>带入业务设备号</QuickFillButton> : null}
            </div>
            <div className="grid-2">
              <Field label="设备 ID"><input className="input" value={listForm.device_id} onChange={(e) => setListForm({ ...listForm, device_id: e.target.value })} /></Field>
              <Field label="设备名称"><input className="input" value={listForm.device_name} onChange={(e) => setListForm({ ...listForm, device_name: e.target.value })} /></Field>
              <Field label="公司 ID"><input className="input" value={listForm.company_id} onChange={(e) => setListForm({ ...listForm, company_id: e.target.value })} /></Field>
              <Field label="公司名称"><input className="input" value={listForm.company_name} onChange={(e) => setListForm({ ...listForm, company_name: e.target.value })} /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={devices.loading} onClick={() => devices.run(() => api.get(`/v1/devices${buildQuery({ ...listForm, company_id: listForm.company_id || undefined })}`))}>查询设备列表</PrimaryButton>
            </div>
            <ResultSummary
              title="最近设备结果"
              items={[
                { label: "详情 ID", value: latestDeviceId, action: latestDeviceId ? <QuickFillButton onClick={() => setDeviceId(latestDeviceId)}>带入详情</QuickFillButton> : null },
                { label: "业务设备号", value: latestBusinessDeviceId, action: latestBusinessDeviceId ? <QuickFillButton onClick={() => {
                  setFileForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }));
                  setLocationForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }));
                }}>带入下游</QuickFillButton> : null },
              ]}
            />
            <CompactTable title="最近设备表" columns={["详情 ID", "业务设备号", "名称", "状态", "操作"]} rows={deviceRows} />
            <ResultPanel result={deviceGroups.result || devices.result} />
          </div>
        </SectionCard>

        <SectionCard title="设备详情与更新" icon={<Pencil size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <HintPanel title="调用链路" tone="info">
              详情与更新都走后端 `/v1/devices/:id` 代理。推荐先查详情确认数据库自增 ID，再修改名称或产品 ID，避免把业务设备号误填到这里。
            </HintPanel>
            <Field label="设备详情 ID（数据库自增）" hint="不是业务设备号；通常来自设备列表返回的 id 字段。"><input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} /></Field>
            {latestDeviceId ? <div className="badge-row"><QuickFillButton onClick={() => setDeviceId(latestDeviceId)}>使用最近结果中的 ID：{latestDeviceId}</QuickFillButton></div> : null}
            <PrimaryButton loading={deviceDetail.loading} onClick={() => deviceDetail.run(() => api.get(`/v1/devices/${deviceId}`))}>获取设备详情</PrimaryButton>
            <div className="grid-2">
              <Field label="更新目标 ID"><input className="input" value={deviceUpdate.id} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, id: e.target.value })} /></Field>
              <Field label="产品 ID"><input className="input" value={deviceUpdate.productId} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, productId: e.target.value })} /></Field>
            </div>
            <Field label="设备名称"><input className="input" value={deviceUpdate.deviceName} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, deviceName: e.target.value })} /></Field>
              <PrimaryButton loading={updateDevice.loading} onClick={() => updateDevice.run(() => api.put(`/v1/devices/${deviceUpdate.id}`, { deviceName: deviceUpdate.deviceName || undefined, productId: deviceUpdate.productId ? Number(deviceUpdate.productId) : undefined }))}>更新设备</PrimaryButton>
            <ResultSummary
              title="详情 / 更新摘要"
              items={[
                { label: "最近详情 ID", value: latestDeviceId, action: latestDeviceId ? <QuickFillButton onClick={() => setDeviceUpdate((prev) => ({ ...prev, id: latestDeviceId }))}>带入更新</QuickFillButton> : null },
                { label: "最近业务设备号", value: latestBusinessDeviceId },
              ]}
            />
            <ResultPanel result={updateDevice.result || deviceDetail.result} />
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="设备文件" icon={<FileSearch size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <HintPanel title="文件操作建议" tone="warn">
              文档里这个接口只支持单日 `date` 查询，不是开始/结束时间区间。现在默认带今天，避免 `photo` 空日期时直接什么都查不到；如需翻历史，改成别的具体日期即可。
            </HintPanel>
            <div className="grid-2">
              <Field label="文件类型"><select className="select" value={fileForm.type} onChange={(e) => setFileForm({ ...fileForm, type: e.target.value })}><option value="photo">photo</option><option value="video">video</option></select></Field>
              <Field label="设备业务 ID" hint="这里使用平台业务设备号，不是数据库自增 ID。"><input className="input" value={fileForm.device_id} onChange={(e) => setFileForm({ ...fileForm, device_id: e.target.value })} placeholder="31011500991323310014" /></Field>
            </div>
            <Field label="日期" hint="改为日期选择器，提交时仍按接口需要发送 yyyy-MM-dd。"><input className="input" type="date" value={toDateInputValue(fileForm.date)} onChange={(e) => setFileForm({ ...fileForm, date: e.target.value })} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={deviceFiles.loading} onClick={() => deviceFiles.run(() => api.get(`/v1/device/file${buildQuery(fileForm)}`))}>查询文件</PrimaryButton>
              {latestBusinessDeviceId ? <QuickFillButton onClick={() => setFileForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }))}>使用最近设备号</QuickFillButton> : null}
              <QuickFillButton onClick={() => setFileForm((prev) => ({ ...prev, date: todayDate }))}>今天</QuickFillButton>
              <QuickFillButton onClick={() => setFileForm((prev) => ({ ...prev, date: yesterdayDate }))}>昨天</QuickFillButton>
            </div>
            <Field label="删除文件路径"><input className="input" value={deletePath} onChange={(e) => setDeletePath(e.target.value)} placeholder="粘贴 path 字段" /></Field>
            {latestFilePath ? <div className="badge-row"><QuickFillButton onClick={() => setDeletePath(latestFilePath)}>使用最近文件 path</QuickFillButton></div> : null}
            <div className="badge-row">
              <button className="button button-danger" onClick={() => deleteFile.run(() => api.post("/v1/device/file/delete", { path: deletePath }))}><Trash2 size={16} />删除文件</button>
            </div>
            <ResultSummary
              title="最近文件结果"
              items={[
                { label: "设备业务号", value: fileForm.device_id },
                { label: "查询日期", value: fileForm.date, action: latestFileDate ? <QuickFillButton onClick={() => setFileForm((prev) => ({ ...prev, date: latestFileDate }))}>使用最近结果日期</QuickFillButton> : null },
                { label: "文件路径", value: latestFilePath, action: latestFilePath ? <QuickFillButton onClick={() => setDeletePath(latestFilePath)}>带入删除</QuickFillButton> : null },
              ]}
            />
            <ResultPreviewList title="最近文件记录" items={filePreviewItems} />
            {photoPreviewItems.length ? (
              <div className="result-summary">
                <div className="result-summary-title">图片预览</div>
                <div className="photo-grid">
                  {photoPreviewItems.map((item) => (
                    <div key={item.id} className="photo-card">
                      <a href={item.url} target="_blank" rel="noreferrer" className="photo-link">
                        <img className="photo-image" src={item.url} alt={item.title} loading="lazy" />
                      </a>
                      <div className="photo-card-body">
                        <div className="photo-card-title">{item.title}</div>
                        {item.meta ? <div className="photo-card-meta">{item.meta}</div> : null}
                        <div className="badge-row">
                          {item.path ? <QuickFillButton onClick={() => setDeletePath(item.path)}>带入删除</QuickFillButton> : null}
                          <a className="button button-secondary quick-fill-button" href={item.url} target="_blank" rel="noreferrer">查看原图</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <ResultPanel result={deleteFile.result || deviceFiles.result} />
          </div>
        </SectionCard>

        <SectionCard title="历史轨迹" icon={<MapPinned size={18} color="#8b5cf6" />}>
          <div className="stack-16">
            <HintPanel title="时间参数说明" tone="info">
              轨迹接口接收秒级时间戳。这里改成日期时间选择器，前端会自动把选择值转换成秒级时间戳再发给后端；`levels` 可按 `1,2,3,4` 组合过滤定位精度来源。
            </HintPanel>
            <Field label="设备业务 ID"><input className="input" value={locationForm.device_id} onChange={(e) => setLocationForm({ ...locationForm, device_id: e.target.value })} /></Field>
            <div className="grid-2">
              <Field label="定位精度 levels"><input className="input" value={locationForm.levels} onChange={(e) => setLocationForm({ ...locationForm, levels: e.target.value })} /></Field>
              <Field label="开始时间"><input className="input" type="datetime-local" value={toDatetimeLocalValue(locationForm.start_time)} onChange={(e) => setLocationForm({ ...locationForm, start_time: toUnixSecondsFromDatetimeLocal(e.target.value) })} /></Field>
            </div>
            <Field label="结束时间"><input className="input" type="datetime-local" value={toDatetimeLocalValue(locationForm.end_time)} onChange={(e) => setLocationForm({ ...locationForm, end_time: toUnixSecondsFromDatetimeLocal(e.target.value) })} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={locations.loading} onClick={() => locations.run(() => api.get(`/v1/locations${buildQuery(locationForm)}`))}>查询轨迹</PrimaryButton>
              {latestBusinessDeviceId ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, device_id: latestBusinessDeviceId }))}>使用最近设备号</QuickFillButton> : null}
              {latestLocationDeviceId ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, device_id: latestLocationDeviceId }))}>使用最近轨迹设备号</QuickFillButton> : null}
              {latestLocationTimeRange.start_time || latestLocationTimeRange.end_time ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, start_time: latestLocationTimeRange.start_time || prev.start_time, end_time: latestLocationTimeRange.end_time || prev.end_time }))}>使用最近轨迹时间段</QuickFillButton> : null}
              <SecondaryButton onClick={() => setLocationForm({ device_id: "", levels: "1,2,3,4", start_time: "", end_time: "" })}>重置</SecondaryButton>
            </div>
            <ResultSummary
              title="最近轨迹摘要"
              items={[
                { label: "轨迹设备号", value: latestLocationDeviceId, action: latestLocationDeviceId ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, device_id: latestLocationDeviceId }))}>带入查询</QuickFillButton> : null },
                { label: "最近开始时间", value: latestLocationTimeRange.start_time, action: latestLocationTimeRange.start_time ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, start_time: latestLocationTimeRange.start_time }))}>带入开始</QuickFillButton> : null },
                { label: "最近结束时间", value: latestLocationTimeRange.end_time, action: latestLocationTimeRange.end_time ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, end_time: latestLocationTimeRange.end_time }))}>带入结束</QuickFillButton> : null },
                { label: "当前 levels", value: locationForm.levels },
              ]}
            />
            <ResultPreviewList title="最近轨迹点" items={locationPreviewItems} />
            <ResultPanel result={locations.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
