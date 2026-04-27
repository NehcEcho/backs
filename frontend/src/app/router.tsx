import { createBrowserRouter, Navigate } from "react-router";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import { AuthUserPage } from "@/app/pages/AuthUserPage";
import { DevicePage } from "@/app/pages/DevicePage";
import { FenceAlarmPage } from "@/app/pages/FenceAlarmPage";
import { GbVideoPage } from "@/app/pages/GbVideoPage";
import { GlobalStatusPage } from "@/app/pages/GlobalStatusPage";
import { HomePortalPage } from "@/app/pages/HomePortalPage";
import { LiveKitPage } from "@/app/pages/LiveKitPage";
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
      { path: "devices", Component: DevicePage },
      { path: "fences-alarms", Component: FenceAlarmPage },
      { path: "gb-video", Component: GbVideoPage },
      { path: "safety-alert", Component: SafetyAlertPage },
      { path: "talk-groups", Component: TalkGroupsPage },
      { path: "rtc-files", Component: RtcFilesPage },
      { path: "livekit", Component: LiveKitPage },
      { path: "account", Component: AuthUserPage },
    ],
  },
]);
