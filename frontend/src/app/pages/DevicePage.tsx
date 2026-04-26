import { useMemo, useState } from "react";
import { Cpu, FileSearch, MapPinned, Pencil, Search, Trash2 } from "lucide-react";
import { Field, PrimaryButton, ResultPanel, SectionCard, SecondaryButton, StatCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery, toPuid } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";

export function DevicePage() {
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
  const [fileForm, setFileForm] = useState({ type: "photo", device_id: "", date: "" });
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

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">设备管理</h1>
          <div className="page-subtitle">这里覆盖设备相关全部后端功能：分组、列表、详情、更新、文件、历史轨迹。</div>
        </div>
        <div className="badge-row">
          <StatusBadge label="设备接口完整覆盖" color="#059669" background="rgba(16,185,129,0.1)" />
        </div>
      </div>

      <div className="grid-4">{stats.map((item) => <StatCard key={item.label} {...item} />)}</div>

      <div className="split-two">
        <SectionCard title="设备分组与列表" icon={<Search size={18} color="#10b981" />}>
          <div className="stack-16">
            <div className="badge-row">
              <PrimaryButton loading={deviceGroups.loading} onClick={() => deviceGroups.run(() => api.get("/v1/user/devices"))}>获取用户设备分组</PrimaryButton>
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
            <ResultPanel result={deviceGroups.result || devices.result} />
          </div>
        </SectionCard>

        <SectionCard title="设备详情与更新" icon={<Pencil size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <Field label="设备详情 ID（数据库自增）"><input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} /></Field>
            <PrimaryButton loading={deviceDetail.loading} onClick={() => deviceDetail.run(() => api.get(`/v1/devices/${deviceId}`))}>获取设备详情</PrimaryButton>
            <div className="grid-2">
              <Field label="更新目标 ID"><input className="input" value={deviceUpdate.id} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, id: e.target.value })} /></Field>
              <Field label="产品 ID"><input className="input" value={deviceUpdate.productId} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, productId: e.target.value })} /></Field>
            </div>
            <Field label="设备名称"><input className="input" value={deviceUpdate.deviceName} onChange={(e) => setDeviceUpdate({ ...deviceUpdate, deviceName: e.target.value })} /></Field>
              <PrimaryButton loading={updateDevice.loading} onClick={() => updateDevice.run(() => api.put(`/v1/devices/${deviceUpdate.id}`, { deviceName: deviceUpdate.deviceName || undefined, productId: deviceUpdate.productId ? Number(deviceUpdate.productId) : undefined }))}>更新设备</PrimaryButton>
            <ResultPanel result={updateDevice.result || deviceDetail.result} />
          </div>
        </SectionCard>
      </div>

      <div className="split-two">
        <SectionCard title="设备文件" icon={<FileSearch size={18} color="#3b82f6" />}>
          <div className="stack-16">
            <div className="grid-2">
              <Field label="文件类型"><select className="select" value={fileForm.type} onChange={(e) => setFileForm({ ...fileForm, type: e.target.value })}><option value="photo">photo</option><option value="video">video</option></select></Field>
              <Field label="设备业务 ID"><input className="input" value={fileForm.device_id} onChange={(e) => setFileForm({ ...fileForm, device_id: e.target.value })} placeholder="31011500991323310014" /></Field>
            </div>
            <Field label="日期（yyyy-MM-dd）"><input className="input" value={fileForm.date} onChange={(e) => setFileForm({ ...fileForm, date: e.target.value })} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={deviceFiles.loading} onClick={() => deviceFiles.run(() => api.get(`/v1/device/file${buildQuery(fileForm)}`))}>查询文件</PrimaryButton>
            </div>
            <Field label="删除文件路径"><input className="input" value={deletePath} onChange={(e) => setDeletePath(e.target.value)} placeholder="粘贴 path 字段" /></Field>
            <div className="badge-row">
              <button className="button button-danger" onClick={() => deleteFile.run(() => api.post("/v1/device/file/delete", { path: deletePath }))}><Trash2 size={16} />删除文件</button>
            </div>
            <ResultPanel result={deleteFile.result || deviceFiles.result} />
          </div>
        </SectionCard>

        <SectionCard title="历史轨迹" icon={<MapPinned size={18} color="#8b5cf6" />}>
          <div className="stack-16">
            <Field label="设备业务 ID"><input className="input" value={locationForm.device_id} onChange={(e) => setLocationForm({ ...locationForm, device_id: e.target.value })} /></Field>
            <div className="grid-2">
              <Field label="定位精度 levels"><input className="input" value={locationForm.levels} onChange={(e) => setLocationForm({ ...locationForm, levels: e.target.value })} /></Field>
              <Field label="开始时间（秒级时间戳）"><input className="input" value={locationForm.start_time} onChange={(e) => setLocationForm({ ...locationForm, start_time: e.target.value })} /></Field>
            </div>
            <Field label="结束时间（秒级时间戳）"><input className="input" value={locationForm.end_time} onChange={(e) => setLocationForm({ ...locationForm, end_time: e.target.value })} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={locations.loading} onClick={() => locations.run(() => api.get(`/v1/locations${buildQuery(locationForm)}`))}>查询轨迹</PrimaryButton>
              <SecondaryButton onClick={() => setLocationForm({ device_id: "", levels: "1,2,3,4", start_time: "", end_time: "" })}>重置</SecondaryButton>
            </div>
            <ResultPanel result={locations.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
