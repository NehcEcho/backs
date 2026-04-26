import { Mic, RadioTower, Volume2 } from "lucide-react";
import { Field, PrimaryButton, ResultPanel, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useState } from "react";

export function TalkGroupsPage() {
  const groups = useRequest<any>();
  const mutations = useRequest<any>();
  const commands = useRequest<any>();
  const [groupId, setGroupId] = useState("1");
  const [groupName, setGroupName] = useState("");
  const [groupPayload, setGroupPayload] = useState('{"groupName":"调试对讲组","deviceList":[1,2]}');
  const [commandPayload, setCommandPayload] = useState('{"groupId":1,"command":"8010","clientId":"mqttjs_debug_001"}');

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1 className="page-title">对讲分组</h1>
          <div className="page-subtitle">对应后端 TalkGroupController，支持分组增删改查和群组对讲指令下发。</div>
        </div>
        <div className="badge-row"><StatusBadge label="8010 / 8011 / 8014 / 8015" color="#059669" background="rgba(16,185,129,0.1)" /></div>
      </div>

      <div className="split-two">
        <SectionCard title="分组查询与维护" icon={<RadioTower size={18} color="#10b981" />}>
          <div className="stack-16">
            <Field label="查询 group_name"><input className="input" value={groupName} onChange={(e) => setGroupName(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={groups.loading} onClick={() => groups.run(() => api.get(`/v1/talkgroups${buildQuery({ group_name: groupName })}`))}>查找分组</PrimaryButton>
            </div>
            <Field label="分组 ID"><input className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)} /></Field>
            <Field label="分组 JSON"><textarea className="textarea" value={groupPayload} onChange={(e) => setGroupPayload(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={mutations.loading} onClick={() => mutations.run(() => api.post("/v1/talkgroups", JSON.parse(groupPayload)))}>新增分组</PrimaryButton>
              <PrimaryButton loading={mutations.loading} onClick={() => mutations.run(() => api.put(`/v1/talkgroups/${groupId}`, JSON.parse(groupPayload)))}>更新分组</PrimaryButton>
              <button className="button button-danger" onClick={() => mutations.run(() => api.delete(`/v1/talkgroups/${groupId}`))}>删除分组</button>
            </div>
            <ResultPanel result={mutations.result || groups.result} />
          </div>
        </SectionCard>

        <SectionCard title="群组对讲指令" icon={<Mic size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <Field label="指令 JSON"><textarea className="textarea" value={commandPayload} onChange={(e) => setCommandPayload(e.target.value)} /></Field>
            <div className="soft-panel" style={{ padding: 14, fontSize: 13, color: "var(--text-soft)", lineHeight: 1.8 }}>
              `command` 支持：`8010` 开启群组对讲、`8011` 结束群组对讲、`8014` 邀请设备通话、`8015` 让设备静音。
            </div>
            <PrimaryButton loading={commands.loading} onClick={() => commands.run(() => api.post("/v1/send-talkgroup-command", JSON.parse(commandPayload)))}>
              <Volume2 size={16} />
              下发对讲指令
            </PrimaryButton>
            <ResultPanel result={commands.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
