import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Cpu, FileSearch, LocateFixed, MapPinned, Pencil, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Field, HintPanel, PrimaryButton, QuickFillButton, ResultPreviewList, ResultSummary, SectionCard, SecondaryButton, StatCard, StatusBadge } from "@/app/components/common";
import { useRequest } from "@/app/hooks/useRequest";
import { useAmap } from "@/app/hooks/useAmap";
import { api } from "@/app/lib/api";
import { buildQuery, findArrayByObjectKeys, findFirstArray, findFirstByKeys, toDateInputValue, toDatetimeLocalValue, toPuid, toUnixSecondsFromDatetimeLocal } from "@/app/lib/utils";

type DeviceAsset = {
  id: string;
  businessId: string;
  name: string;
  status: string;
  company: string;
  productId: string;
};

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
  const locationMapRef = useRef<HTMLDivElement | null>(null);
  const locationMapInstanceRef = useRef<any>(null);
  const locationOverlayRef = useRef<any[]>([]);
  const { ready: amapReady, error: amapError } = useAmap();

  const [listForm, setListForm] = useState({ is_page: true, page_index: 1, page_size: 12, device_id: "", device_name: "", company_id: "", company_name: "" });
  const [deviceId, setDeviceId] = useState("1");
  const [deviceUpdate, setDeviceUpdate] = useState({ id: "1", deviceName: "", productId: "" });
  const [fileForm, setFileForm] = useState({ type: "photo", device_id: "", date: todayDate });
  const [deletePath, setDeletePath] = useState("");
  const [locationForm, setLocationForm] = useState({ device_id: "", levels: "1,2,3,4", start_time: "", end_time: "" });

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

  const deviceItems = useMemo(() => {
    return findArrayByObjectKeys(latestDevicePayload, ["id", "device_id", "deviceName", "status"]).slice(0, 24).map((item, index) => ({
      id: String(findFirstByKeys(item, ["id", "deviceId"]) ?? index + 1),
      businessId: String(findFirstByKeys(item, ["device_id", "deviceId", "sn", "serial"]) ?? "-"),
      name: String(findFirstByKeys(item, ["deviceName", "name"]) ?? `设备 ${index + 1}`),
      status: String(findFirstByKeys(item, ["status"]) ?? "未知"),
      company: String(findFirstByKeys(item, ["companyName", "company_name"]) ?? "未分配单位"),
      productId: String(findFirstByKeys(item, ["productId"]) ?? "-"),
    })) as DeviceAsset[];
  }, [latestDevicePayload]);

  const selectedDevice = useMemo(() => {
    const detailPayload = deviceDetail.result?.data?.payload;
    const detailId = findFirstByKeys(detailPayload, ["id", "deviceId"]);
    if (detailId !== undefined) {
      return {
        id: String(detailId),
        businessId: String(findFirstByKeys(detailPayload, ["device_id", "deviceId", "sn", "serial"]) ?? "-"),
        name: String(findFirstByKeys(detailPayload, ["deviceName", "name"]) ?? "未命名设备"),
        status: String(findFirstByKeys(detailPayload, ["status"]) ?? "未知"),
        company: String(findFirstByKeys(detailPayload, ["companyName", "company_name"]) ?? "未分配单位"),
        productId: String(findFirstByKeys(detailPayload, ["productId"]) ?? "-"),
      };
    }
    return deviceItems.find((item) => item.id === deviceId) ?? deviceItems[0] ?? null;
  }, [deviceDetail.result, deviceItems, deviceId]);

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
    const items = findArrayByObjectKeys(locations.result?.data?.payload, ["longitude", "latitude", "device_id", "deviceId"]).slice(0, 6);
    return items.map((item, index) => {
      const device = findFirstByKeys(item, ["device_id", "deviceId"]);
      const longitude = findFirstByKeys(item, ["longitude", "lng"]);
      const latitude = findFirstByKeys(item, ["latitude", "lat"]);
      const time = findFirstByKeys(item, ["time", "gpsTime", "createTime"]);
      return {
        id: `${device || longitude || index}`,
        title: device ? `设备 ${String(device)}` : `轨迹点 ${index + 1}`,
        meta: [longitude !== undefined && latitude !== undefined ? `坐标 ${String(longitude)}, ${String(latitude)}` : null, time ? `时间 ${String(time)}` : null].filter(Boolean).join(" | "),
        action: device ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, device_id: String(device) }))}>定位此设备</QuickFillButton> : undefined,
      };
    });
  }, [locations.result]);

  const latestLocationPoint = useMemo(() => {
    const items = findArrayByObjectKeys(locations.result?.data?.payload, ["longitude", "latitude", "device_id", "deviceId"]);
    const first = items[0];
    if (!first) return null;
    const longitude = findFirstByKeys(first, ["longitude", "lng"]);
    const latitude = findFirstByKeys(first, ["latitude", "lat"]);
    const time = findFirstByKeys(first, ["time", "gpsTime", "createTime"]);
    const device = findFirstByKeys(first, ["device_id", "deviceId"]);
    const lng = longitude === undefined ? null : Number(longitude);
    const lat = latitude === undefined ? null : Number(latitude);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return {
      longitude: lng,
      latitude: lat,
      time: time === undefined ? "" : String(time),
      deviceId: device === undefined ? "" : String(device),
    };
  }, [locations.result]);

  const stats = useMemo(
    () => [
      { label: "当前可见设备", value: String(deviceItems.length || 0), trend: "来自当前筛选结果", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <Cpu size={20} color="#10b981" /> },
      { label: "当前查看设备", value: selectedDevice?.name || "未选择", trend: selectedDevice?.businessId || "等待选择设备", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <ShieldCheck size={20} color="#3b82f6" /> },
      { label: "照片查询日期", value: fileForm.date, trend: fileForm.type === "photo" ? "按单日照片检索" : "切换到视频文件检索", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Camera size={20} color="#f59e0b" /> },
      { label: "RTC 关联号", value: toPuid(selectedDevice?.businessId || fileForm.device_id || "31011500991323310018"), trend: "可供视频与下载链路复用", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <LocateFixed size={20} color="#8b5cf6" /> },
    ],
    [deviceItems.length, selectedDevice, fileForm.date, fileForm.device_id, fileForm.type],
  );

  useEffect(() => {
    void devices.run(() => api.get(`/v1/devices${buildQuery({ ...listForm, company_id: listForm.company_id || undefined })}`));
  }, []);

  useEffect(() => {
    if (!latestDeviceId) return;
    setDeviceId(latestDeviceId);
    setDeviceUpdate((prev) => ({ ...prev, id: latestDeviceId }));
  }, [latestDeviceId]);

  useEffect(() => {
    if (!latestBusinessDeviceId) return;
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

  useEffect(() => {
    if (!amapReady || !locationMapRef.current || !window.AMap) return;

    if (!locationMapInstanceRef.current) {
      locationMapInstanceRef.current = new window.AMap.Map(locationMapRef.current, {
        zoom: 15,
        center: latestLocationPoint ? [latestLocationPoint.longitude, latestLocationPoint.latitude] : [116.397428, 39.90923],
        showLabel: true,
        viewMode: "2D",
      });
    }

    const map = locationMapInstanceRef.current;
    locationOverlayRef.current.forEach((item) => map.remove(item));
    locationOverlayRef.current = [];

    if (!latestLocationPoint) return;

    const marker = new window.AMap.Marker({
      position: [latestLocationPoint.longitude, latestLocationPoint.latitude],
      anchor: "bottom-center",
      content: `<div class="trajectory-hat-pin"><div class="trajectory-hat-pin-core"></div></div>`,
    });

    const ring = new window.AMap.CircleMarker({
      center: [latestLocationPoint.longitude, latestLocationPoint.latitude],
      radius: 18,
      strokeColor: "#8b5cf6",
      strokeWeight: 2,
      fillColor: "#8b5cf6",
      fillOpacity: 0.16,
    });

    const infoWindow = new window.AMap.InfoWindow({
      offset: new window.AMap.Pixel(0, -20),
      content: `<div style="padding:12px;min-width:220px;line-height:1.7;"><div style="font-size:14px;font-weight:600;color:#2d2d2d;">帽子最新定位点</div><div style="font-size:12px;color:#6b7280;">设备号：${latestLocationPoint.deviceId || "-"}</div><div style="font-size:12px;color:#6b7280;">经纬度：${latestLocationPoint.longitude}, ${latestLocationPoint.latitude}</div><div style="font-size:12px;color:#6b7280;">时间：${latestLocationPoint.time || "-"}</div></div>`,
    });

    marker.on("click", () => infoWindow.open(map, [latestLocationPoint.longitude, latestLocationPoint.latitude]));
    marker.setMap(map);
    ring.setMap(map);
    locationOverlayRef.current = [marker, ring];
    map.setCenter([latestLocationPoint.longitude, latestLocationPoint.latitude]);
    map.setFitView(locationOverlayRef.current, false, [60, 60, 60, 60]);

    return () => {
      locationOverlayRef.current.forEach((item) => map.remove(item));
      locationOverlayRef.current = [];
    };
  }, [amapReady, latestLocationPoint]);

  useEffect(() => () => {
    if (locationMapInstanceRef.current) {
      locationMapInstanceRef.current.destroy();
      locationMapInstanceRef.current = null;
    }
  }, []);

  const applySelectedDevice = (asset: DeviceAsset) => {
    setDeviceId(asset.id);
    setDeviceUpdate((prev) => ({ ...prev, id: asset.id, deviceName: asset.name, productId: asset.productId !== "-" ? asset.productId : prev.productId }));
    setFileForm((prev) => ({ ...prev, device_id: asset.businessId }));
    setLocationForm((prev) => ({ ...prev, device_id: asset.businessId }));
    void deviceDetail.run(() => api.get(`/v1/devices/${asset.id}`));
  };

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">设备管理</h1>
          <div className="page-subtitle">围绕设备资产、现场照片和历史轨迹进行日常管理，不再暴露测试型接口入口。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="设备业务已接通" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">{stats.map((item) => <StatCard key={item.label} {...item} />)}</div>

      <div className="split-two">
        <SectionCard title="设备资产总览" icon={<Search size={18} color="#10b981" />}>
          <div className="stack-16">
            <HintPanel title="资产检索" tone="info">
              先按设备号、名称或所属单位缩小范围，再进入单设备详情、照片与轨迹。页面会自动把选中的设备带入下方模块。
            </HintPanel>
            <div className="grid-2">
              <Field label="设备业务号"><input className="input" value={listForm.device_id} onChange={(e) => setListForm({ ...listForm, device_id: e.target.value })} placeholder="31011500991323310014" /></Field>
              <Field label="设备名称"><input className="input" value={listForm.device_name} onChange={(e) => setListForm({ ...listForm, device_name: e.target.value })} placeholder="如 运输头盔 A-12" /></Field>
              <Field label="公司 ID"><input className="input" value={listForm.company_id} onChange={(e) => setListForm({ ...listForm, company_id: e.target.value })} /></Field>
              <Field label="公司名称"><input className="input" value={listForm.company_name} onChange={(e) => setListForm({ ...listForm, company_name: e.target.value })} placeholder="矿区单位名称" /></Field>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={devices.loading} onClick={() => devices.run(() => api.get(`/v1/devices${buildQuery({ ...listForm, company_id: listForm.company_id || undefined })}`))}>刷新设备列表</PrimaryButton>
              <SecondaryButton onClick={() => deviceGroups.run(() => api.get("/v1/user/devices"))}>同步可见分组</SecondaryButton>
            </div>
            <ResultSummary
              title="当前选中设备"
              items={[
                { label: "设备名称", value: selectedDevice?.name || "未选择" },
                { label: "业务设备号", value: selectedDevice?.businessId || latestBusinessDeviceId },
                { label: "详情 ID", value: selectedDevice?.id || latestDeviceId },
                { label: "所属单位", value: selectedDevice?.company || "-" },
              ]}
            />
            <div className="device-card-grid">
              {deviceItems.length ? deviceItems.map((asset) => {
                const active = selectedDevice?.id === asset.id;
                return (
                  <button key={`${asset.id}-${asset.businessId}`} className={`device-asset-card ${active ? "device-asset-card-active" : ""}`} onClick={() => applySelectedDevice(asset)}>
                    <div className="device-asset-top">
                      <div>
                        <div className="device-asset-name">{asset.name}</div>
                        <div className="device-asset-meta">{asset.businessId}</div>
                      </div>
                      <StatusBadge label={asset.status} color={asset.status.toLowerCase() === "online" ? "#059669" : "#6b7280"} background={asset.status.toLowerCase() === "online" ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.12)"} />
                    </div>
                    <div className="device-asset-meta">{asset.company}</div>
                    <div className="device-asset-footer">点击查看详情、照片与轨迹</div>
                  </button>
                );
              }) : <div className="empty-hint">当前没有找到设备，请调整筛选条件后重试。</div>}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="设备档案维护" icon={<Pencil size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <div className="device-profile-card">
              <div className="device-profile-avatar">{(selectedDevice?.name || "设")[0]}</div>
              <div>
                <div className="device-profile-title">{selectedDevice?.name || "请选择设备"}</div>
                <div className="device-profile-subtitle">{selectedDevice?.businessId || "尚未带入业务设备号"}</div>
              </div>
            </div>
            <div className="device-detail-grid">
              <div className="device-detail-item"><span>详情 ID</span><strong>{selectedDevice?.id || "-"}</strong></div>
              <div className="device-detail-item"><span>设备状态</span><strong>{selectedDevice?.status || "-"}</strong></div>
              <div className="device-detail-item"><span>所属单位</span><strong>{selectedDevice?.company || "-"}</strong></div>
              <div className="device-detail-item"><span>产品 ID</span><strong>{selectedDevice?.productId || "-"}</strong></div>
            </div>
            <div className="badge-row">
              <PrimaryButton loading={deviceDetail.loading} onClick={() => deviceDetail.run(() => api.get(`/v1/devices/${deviceId}`))}>刷新设备档案</PrimaryButton>
            </div>
            <div className="grid-2">
              <Field label="设备详情 ID"><input className="input" value={deviceUpdate.id} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, id: e.target.value })} /></Field>
              <Field label="产品 ID"><input className="input" value={deviceUpdate.productId} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, productId: e.target.value })} /></Field>
            </div>
            <Field label="设备名称"><input className="input" value={deviceUpdate.deviceName} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, deviceName: e.target.value })} placeholder="修改现场显示名称" /></Field>
            <div className="badge-row">
              <PrimaryButton loading={updateDevice.loading} onClick={() => updateDevice.run(() => api.put(`/v1/devices/${deviceUpdate.id}`, { deviceName: deviceUpdate.deviceName || undefined, productId: deviceUpdate.productId ? Number(deviceUpdate.productId) : undefined }))}>保存设备信息</PrimaryButton>
            </div>
            {(updateDevice.result?.ok === false || deviceDetail.result?.ok === false) ? <HintPanel tone="warn" title="设备档案提示">{updateDevice.result?.error || deviceDetail.result?.error}</HintPanel> : null}
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="现场照片与文件" icon={<FileSearch size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="文件类型"><select className="select" value={fileForm.type} onChange={(e) => setFileForm({ ...fileForm, type: e.target.value })}><option value="photo">现场照片</option><option value="video">视频文件</option></select></Field>
              <Field label="设备业务号"><input className="input" value={fileForm.device_id} onChange={(e) => setFileForm({ ...fileForm, device_id: e.target.value })} placeholder="自动带入选中设备" /></Field>
            </div>
            <Field label="采集日期"><input className="input" type="date" value={toDateInputValue(fileForm.date)} onChange={(e) => setFileForm({ ...fileForm, date: e.target.value })} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={deviceFiles.loading} onClick={() => deviceFiles.run(() => api.get(`/v1/device/file${buildQuery(fileForm)}`))}>读取文件记录</PrimaryButton>
              <QuickFillButton onClick={() => setFileForm((prev) => ({ ...prev, date: todayDate }))}>今天</QuickFillButton>
              <QuickFillButton onClick={() => setFileForm((prev) => ({ ...prev, date: yesterdayDate }))}>昨天</QuickFillButton>
            </div>
            <ResultSummary
              title="文件查询摘要"
              items={[
                { label: "设备业务号", value: fileForm.device_id },
                { label: "查询日期", value: fileForm.date },
                { label: "最近文件路径", value: latestFilePath, action: latestFilePath ? <QuickFillButton onClick={() => setDeletePath(latestFilePath)}>带入删除</QuickFillButton> : null },
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
            <div className="device-delete-box">
              <Field label="删除文件路径" hint="仅在确认文件误传或已备份后使用。"><input className="input" value={deletePath} onChange={(e) => setDeletePath(e.target.value)} placeholder="选择图片后会自动带入" /></Field>
              <button className="button button-danger" onClick={() => deleteFile.run(() => api.post("/v1/device/file/delete", { path: deletePath }))}><Trash2 size={16} />删除文件</button>
            </div>
            {deleteFile.result?.ok === false || deviceFiles.result?.ok === false ? <HintPanel tone="warn" title="文件操作提示">{deleteFile.result?.error || deviceFiles.result?.error}</HintPanel> : null}
          </div>
        </SectionCard>

        <SectionCard title="设备轨迹回看" icon={<MapPinned size={18} color="#8b5cf6" />}>
          <div className="stack-16">
            <HintPanel title="轨迹回看" tone="info">
              适合值守或追溯场景。选择设备和时间范围后即可回看定位点，时间输入已转成用户可选的日期时间控件。
            </HintPanel>
            <Field label="设备业务号"><input className="input" value={locationForm.device_id} onChange={(e) => setLocationForm({ ...locationForm, device_id: e.target.value })} placeholder="自动带入选中设备" /></Field>
            <div className="grid-2">
              <Field label="定位精度 levels"><input className="input" value={locationForm.levels} onChange={(e) => setLocationForm({ ...locationForm, levels: e.target.value })} /></Field>
              <Field label="开始时间"><input className="input" type="datetime-local" value={toDatetimeLocalValue(locationForm.start_time)} onChange={(e) => setLocationForm({ ...locationForm, start_time: toUnixSecondsFromDatetimeLocal(e.target.value) })} /></Field>
            </div>
            <Field label="结束时间"><input className="input" type="datetime-local" value={toDatetimeLocalValue(locationForm.end_time)} onChange={(e) => setLocationForm({ ...locationForm, end_time: toUnixSecondsFromDatetimeLocal(e.target.value) })} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={locations.loading} onClick={() => locations.run(() => api.get(`/v1/locations${buildQuery(locationForm)}`))}>查询轨迹</PrimaryButton>
              <QuickFillButton onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
                setLocationForm((prev) => ({ ...prev, start_time: String(Math.floor(start.getTime() / 1000)), end_time: String(Math.floor(end.getTime() / 1000)) }));
              }}>最近24小时</QuickFillButton>
              {latestLocationTimeRange.start_time || latestLocationTimeRange.end_time ? <QuickFillButton onClick={() => setLocationForm((prev) => ({ ...prev, start_time: latestLocationTimeRange.start_time || prev.start_time, end_time: latestLocationTimeRange.end_time || prev.end_time }))}>使用最近轨迹时间段</QuickFillButton> : null}
            </div>
            <ResultSummary
              title="轨迹查询摘要"
              items={[
                { label: "轨迹设备号", value: latestLocationDeviceId || locationForm.device_id },
                { label: "开始时间", value: toDatetimeLocalValue(locationForm.start_time) || "-" },
                { label: "结束时间", value: toDatetimeLocalValue(locationForm.end_time) || "-" },
                { label: "精度过滤", value: locationForm.levels },
              ]}
            />
            <div className="result-summary">
              <div className="result-summary-title">帽子返回定位点</div>
              <div className="trajectory-map-card">
                <div className="trajectory-map-meta">
                  <div className="trajectory-map-badge">最新帽子坐标</div>
                  <div className="trajectory-map-coords">{latestLocationPoint ? `${latestLocationPoint.longitude}, ${latestLocationPoint.latitude}` : "等待返回经纬度"}</div>
                  <div className="trajectory-map-submeta">{latestLocationPoint ? `设备 ${latestLocationPoint.deviceId || "-"} · ${latestLocationPoint.time || "-"}` : (amapError || "查询轨迹后，这里会用一个点标出帽子返回的经纬度。")}</div>
                </div>
                <div className="trajectory-map-shell">
                  <div ref={locationMapRef} className="trajectory-map-canvas">
                    {!amapReady ? <div className="empty-hint"><MapPinned size={32} color="#8b5cf6" /><div>{amapError || "正在加载定位地图..."}</div></div> : null}
                    {amapReady && !latestLocationPoint ? <div className="soft-panel trajectory-map-empty">等待轨迹接口返回帽子经纬度</div> : null}
                  </div>
                </div>
              </div>
            </div>
            <ResultPreviewList title="最近轨迹点" items={locationPreviewItems} />
            {(locations.result?.ok === false) ? <HintPanel tone="warn" title="轨迹查询提示">{locations.result?.error}</HintPanel> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
