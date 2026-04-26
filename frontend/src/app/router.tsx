import { createBrowserRouter, Navigate } from "react-router";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import { AnalysisPage } from "@/app/pages/AnalysisPage";
import { AuthUserPage } from "@/app/pages/AuthUserPage";
import { DevicePage } from "@/app/pages/DevicePage";
import { FenceAlarmPage } from "@/app/pages/FenceAlarmPage";
import { GbVideoPage } from "@/app/pages/GbVideoPage";
import { GlobalStatusPage } from "@/app/pages/GlobalStatusPage";
import { HomePortalPage } from "@/app/pages/HomePortalPage";
import { LiveKitPage } from "@/app/pages/LiveKitPage";
import { LocalWorkbenchPage } from "@/app/pages/LocalWorkbenchPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { RtcFilesPage } from "@/app/pages/RtcFilesPage";
import { SafetyAlertPage } from "@/app/pages/SafetyAlertPage";
import { TalkGroupsPage } from "@/app/pages/TalkGroupsPage";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  {
    path: "/",
    Component: AdminLayout,
    children: [
      { index: true, element: <Navigate to="/home-portal" replace /> },
      { path: "home-portal", Component: HomePortalPage },
      { path: "global-status", Component: GlobalStatusPage },
      { path: "auth-user", Component: AuthUserPage },
      { path: "devices", Component: DevicePage },
      { path: "fences-alarms", Component: FenceAlarmPage },
      { path: "talk-groups", Component: TalkGroupsPage },
      { path: "gb-video", Component: GbVideoPage },
      { path: "rtc-files", Component: RtcFilesPage },
      { path: "livekit", Component: LiveKitPage },
      { path: "local-workbench", Component: LocalWorkbenchPage },
      { path: "analysis-result", Component: AnalysisPage },
      { path: "safety-alert", Component: SafetyAlertPage },
    ],
  },
]);
