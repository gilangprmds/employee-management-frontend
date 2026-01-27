import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PrivateRoute from "./routes/PrivateRoute";
import AuthRoute from "./routes/AuthRoute";
import UserManagement from "./pages/Employee/EmployeeManagement";
import AttendanceCalendarView from "./pages/Attendance";
import AttendanceRecordsPage from "./pages/AttendanceRecords";
import Attendance2 from "./pages/ListAttendance";
import Home2 from "./pages/Dashboard/Home2";
import EmployeeProfile from "./pages/Employee/EmployeeProfile";
import AddEmployee from "./pages/Employee/AddEmployee";
import RoleManagement from "./pages/RoleManagement";
import PermissionManagement from "./pages/PermissionManagement";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ==== PUBLIC ROUTES ==== */}
        <Route
          path="/signin"
          element={
            <AuthRoute>
              <SignIn />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUp />
            </AuthRoute>
          }
        />

        {/* ==== PROTECTED ROUTES ==== */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route index path="/dashboard2" element={<Home2 />} />

            {/* Others */}
            <Route path="/profile" element={<UserProfiles />} />

            <Route path="/manajemen-karyawan" element={<UserManagement />} />
            <Route
              path="/manajemen-karyawan/:id"
              element={<EmployeeProfile />}
            />
            <Route
              path="/manajemen-karyawan/tambah"
              element={<AddEmployee />}
            />

            <Route path="/attendance" element={<AttendanceCalendarView />} />
            <Route path="/attendance2" element={<Attendance2 />} />
            <Route
              path="/attendance-records"
              element={<AttendanceRecordsPage />}
            />

            <Route path="/role-permission" element={<RoleManagement />} />
            <Route path="/permission" element={<PermissionManagement />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* UI Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
