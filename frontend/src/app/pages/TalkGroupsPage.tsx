import { Mic, RadioTower, Volume2 } from "lucide-react";
import { CompactTable, Field, HintPanel, JsonErrorNotice, PrimaryButton, QuickFillButton, ResultPanel, ResultSummary, SectionCard, StatusBadge } from "@/app/components/common";
import { api } from "@/app/lib/api";
import { buildQuery, findArrayByObjectKeys, findFirstByKeys, parseJsonInput } from "@/app/lib/utils";
import { useRequest } from "@/app/hooks/useRequest";
import { useEffect, useMemo, useState } from "react";

export function TalkGroupsPage() {
  const groups = useRequest<any>();
  const mutations = useRequest<any>();
  const commands = useRequest<any>();
  const [groupId, setGroupId] = useState("1");
  const [groupName, setGroupName] = useState("");
  const [groupPayload, setGroupPayload] = useState('{"groupName":"调试对讲组","deviceList":[1,2]}');
  const [commandPayload, setCommandPayload] = useState('{"groupId":1,"command":"8010","clientId":"mqttjs_debug_001"}');

  const groupJson = useMemo(() => parseJsonInput(groupPayload), [groupPayload]);
  const commandJson = useMemo(() => parseJsonInput(commandPayload), [commandPayload]);

  const latestGroupId = useMemo(() => {
    const value = findFirstByKeys(mutations.result?.data?.payload ?? groups.result?.data?.payload ?? commands.result?.data?.payload, ["id", "groupId"]);
    return value === undefined ? "" : String(value);
  }, [groups.result, mutations.result, commands.result]);

  const latestGroupName = useMemo(() => {
    const value = findFirstByKeys(groups.result?.data?.payload ?? mutations.result?.data?.payload, ["groupName", "name"]);
    return value === undefined ? "" : String(value);
  }, [groups.result, mutations.result]);

  const groupRows = useMemo(() => {
    return findArrayByObjectKeys(groups.result?.data?.payload ?? mutations.result?.data?.payload, ["id", "groupId", "groupName"]).slice(0, 4).map((item) => {
      const id = findFirstByKeys(item, ["id", "groupId"]);
      const name = findFirstByKeys(item, ["groupName", "name"]);
      const devices = findFirstByKeys(item, ["deviceList", "devices"]);
      const deviceCount = Array.isArray(devices) ? devices.length : "-";
      return [
        String(id ?? "-"),
        String(name ?? "-"),
        String(deviceCount),
        id ? <QuickFillButton onClick={() => setGroupId(String(id))}>带入</QuickFillButton> : "-",
      ];
    });
  }, [groups.result, mutations.result]);

  useEffect(() => {
    if (!latestGroupId) return;
    setGroupId(latestGroupId);
    const parsed = parseJsonInput<Record<string, unknown>>(commandPayload);
    if (!parsed.ok || typeof parsed.data !== "object" || !parsed.data) return;
    setCommandPayload(JSON.stringify({ ...parsed.data, groupId: Number(latestGroupId) || latestGroupId }, null, 2));
  }, [latestGroupId]);

  useEffect(() => {
    if (!latestGroupName) return;
    setGroupName(latestGroupName);
  }, [latestGroupName]);

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
            <HintPanel title="推荐流程" tone="info">
              先按 `group_name` 查分组，再把返回里的 `groupId` 带入维护区。新增或更新后，右侧对讲指令也可以直接复用最近分组 ID。
            </HintPanel>
            <Field label="查询 group_name"><input className="input" value={groupName} onChange={(e) => setGroupName(e.target.value)} /></Field>
            <div className="badge-row">
              <PrimaryButton loading={groups.loading} onClick={() => groups.run(() => api.get(`/v1/talkgroups${buildQuery({ group_name: groupName })}`))}>查找分组</PrimaryButton>
              {latestGroupName ? <QuickFillButton onClick={() => setGroupName(latestGroupName)}>使用最近分组名</QuickFillButton> : null}
              {latestGroupId ? <QuickFillButton onClick={() => setGroupId(latestGroupId)}>使用最近分组 ID</QuickFillButton> : null}
            </div>
            <Field label="分组 ID" hint="通常来自分组列表、新增分组或更新分组结果中的 id/groupId 字段。"><input className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)} /></Field>
            <Field label="分组 JSON"><textarea className="textarea" value={groupPayload} onChange={(e) => setGroupPayload(e.target.value)} /></Field>
            <JsonErrorNotice error={groupJson.ok ? null : groupJson.error} />
            <div className="badge-row">
              <PrimaryButton loading={mutations.loading} disabled={!groupJson.ok} onClick={() => groupJson.ok && mutations.run(() => api.post("/v1/talkgroups", groupJson.data))}>新增分组</PrimaryButton>
              <PrimaryButton loading={mutations.loading} disabled={!groupJson.ok} onClick={() => groupJson.ok && mutations.run(() => api.put(`/v1/talkgroups/${groupId}`, groupJson.data))}>更新分组</PrimaryButton>
              <button className="button button-danger" onClick={() => mutations.run(() => api.delete(`/v1/talkgroups/${groupId}`))}>删除分组</button>
              {latestGroupId ? <QuickFillButton onClick={() => setGroupId(latestGroupId)}>带入最近分组 ID</QuickFillButton> : null}
            </div>
            <ResultSummary
              title="分组结果摘要"
              items={[
                { label: "最近分组 ID", value: latestGroupId, action: latestGroupId ? <QuickFillButton onClick={() => setGroupId(latestGroupId)}>带入维护</QuickFillButton> : null },
                { label: "最近分组名", value: latestGroupName, action: latestGroupName ? <QuickFillButton onClick={() => setGroupName(latestGroupName)}>带入查询</QuickFillButton> : null },
                { label: "当前查询名", value: groupName },
              ]}
            />
            <CompactTable title="最近分组表" columns={["Group ID", "分组名", "设备数", "操作"]} rows={groupRows} />
            <ResultPanel result={mutations.result || groups.result} />
          </div>
        </SectionCard>

        <SectionCard title="群组对讲指令" icon={<Mic size={18} color="#f59e0b" />}>
          <div className="stack-16">
            <HintPanel title="指令下发" tone="info">
              `8010` / `8011` 用于开始或结束群组对讲，`8014` / `8015` 用于邀请设备或静音设备。若上一步已经查到/创建了分组，可直接把最近 `groupId` 带入这里。
            </HintPanel>
            <Field label="指令 JSON"><textarea className="textarea" value={commandPayload} onChange={(e) => setCommandPayload(e.target.value)} /></Field>
            <JsonErrorNotice error={commandJson.ok ? null : commandJson.error} />
            <div className="badge-row">
              <PrimaryButton loading={commands.loading} disabled={!commandJson.ok} onClick={() => commandJson.ok && commands.run(() => api.post("/v1/send-talkgroup-command", commandJson.data))}>
                <Volume2 size={16} />
                下发对讲指令
              </PrimaryButton>
              {latestGroupId ? <QuickFillButton onClick={() => setCommandPayload(JSON.stringify({ groupId: Number(latestGroupId) || latestGroupId, command: "8010", clientId: "mqttjs_debug_001" }, null, 2))}>生成最近分组指令模板</QuickFillButton> : null}
            </div>
            <ResultSummary
              title="指令摘要"
              items={[
                { label: "指令目标 groupId", value: latestGroupId, action: latestGroupId ? <QuickFillButton onClick={() => setCommandPayload(JSON.stringify({ groupId: Number(latestGroupId) || latestGroupId, command: "8010", clientId: "mqttjs_debug_001" }, null, 2))}>生成模板</QuickFillButton> : null },
                { label: "默认命令", value: commandJson.ok && typeof commandJson.data === "object" && commandJson.data && "command" in commandJson.data ? String((commandJson.data as Record<string, unknown>).command ?? "") : "" },
                { label: "clientId", value: commandJson.ok && typeof commandJson.data === "object" && commandJson.data && "clientId" in commandJson.data ? String((commandJson.data as Record<string, unknown>).clientId ?? "") : "" },
              ]}
            />
            <ResultPanel result={commands.result} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
