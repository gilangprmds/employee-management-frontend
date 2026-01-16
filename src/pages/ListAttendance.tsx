import ComponentCard from "../components/common/ComponentCard";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Badge from "../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  attendanceApi,
  AttendanceQueryParams,
  AttendanceResponse,
  PaginationData,
} from "../api/attendanceApi";
import { useCallback, useEffect, useRef, useState } from "react";
import Label from "../components/form/Label";
import Select from "../components/form/Select";
import {
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Eye,
  Filter,
  MapPin,
  Navigation,
  Search,
  Smartphone,
  User,
  XCircle,
} from "lucide-react";
import Input from "../components/form/input/InputField";
import { Button } from "../components/ui/button2";
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { id as indonesianLocale, se } from "date-fns/locale";
import DateRangePicker from "../components/form/date-range-picker";
import { useModal } from "../hooks/useModal";
import { Modal } from "../components/ui/modal";

export default function Attendance2() {
  // 1. Definisikan state untuk data, loading, dan error
  const [data, setData] = useState<PaginationData>();
  const [loading, setLoading] = useState(false); // Ubah ke false initial
  const [error, setError] = useState<Error | null>(null);

  // modal
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceResponse | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // Track initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const initialLoadRef = useRef(true);

  // Hitung default dates
  const getDefaultDates = () => {
    const today = new Date();
    return {
      start: format(subDays(today, 29), "yyyy-MM-dd"),
      end: format(today, "yyyy-MM-dd"),
    };
  };

  const defaultDates = getDefaultDates();

  // Filter date - langsung dengan default value
  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);

  // Filter - langsung dengan default
  const [filter, setFilter] = useState<AttendanceQueryParams>({
    page: 0,
    size: pageSize,
    startDate: defaultDates.start,
    endDate: defaultDates.end,
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi untuk mengatur default 30 hari terakhir
  const setDefaultDateRange = useCallback(() => {
    const today = new Date();
    const defaultStart = format(subDays(today, 29), "yyyy-MM-dd");
    const defaultEnd = format(today, "yyyy-MM-dd");

    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setFilter((prev) => ({
      ...prev,
      startDate: defaultStart,
      endDate: defaultEnd,
      page: 0,
    }));
  }, []);

  // Update quickDateOptions untuk menandai "30 hari terakhir" sebagai aktif
  const quickDateOptions = [
    { label: "Hari ini", value: "today" },
    { label: "Kemarin", value: "yesterday" },
    { label: "7 hari terakhir", value: "last7days" },
    { label: "30 hari terakhir", value: "last30days", isDefault: true }, // Tambahkan flag
    { label: "Bulan ini", value: "thisMonth" },
    { label: "Bulan lalu", value: "lastMonth" },
  ];

  // Update handleQuickDateSelect untuk memanggil setDefaultDateRange saat dipilih
  const handleQuickDateSelect = (value: string) => {
    const today = new Date();
    let start = "";
    let end = format(today, "yyyy-MM-dd");

    switch (value) {
      case "today":
        start = end;
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        start = format(yesterday, "yyyy-MM-dd");
        end = start;
        break;
      case "last7days":
        start = format(subDays(today, 6), "yyyy-MM-dd");
        break;
      case "last30days":
        // Panggil fungsi yang sama dengan inisialisasi
        setDefaultDateRange();
        return; // Return agar tidak double set state
      case "thisMonth":
        start = format(startOfMonth(today), "yyyy-MM-dd");
        break;
      case "lastMonth":
        const firstDayLastMonth = startOfMonth(subMonths(today, 1));
        const lastDayLastMonth = endOfMonth(subMonths(today, 1));
        start = format(firstDayLastMonth, "yyyy-MM-dd");
        end = format(lastDayLastMonth, "yyyy-MM-dd");
        break;
    }

    setStartDate(start);
    setEndDate(end);
    setFilter((prev) => ({ ...prev, startDate: start, endDate: end, page: 0 }));
  };

  // Departement & Status Filter
  const departmentOptions = [
    { value: "ALL", label: "Semua Department" },
    { value: "ADMIN", label: "Admin" },
    { value: "EMPLOYEE", label: "Employee" },
  ];
  const handleDepartmentChange = (value: string) => {
    const departmentValue = value === "ALL" ? "" : value;
    setFilter((prev) => ({ ...prev, role: departmentValue, page: 0 }));
  };

  const statusOptions = [
    { value: "ALL", label: "Semua Status" },
    { value: "PRESENT", label: "Tepat Waktu" },
    { value: "LATE", label: "Terlambat" },
  ];
  const handleStatusChange = (value: string) => {
    const statusValue = value === "ALL" ? "" : value;

    setFilter((prev) => ({ ...prev, status: statusValue, page: 0 }));
  };

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
  ];

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setFilter((prev) => ({ ...prev, size: parseInt(value), page: 0 }));
  };

  // // Helper untuk memformat OffsetDateTime menjadi Jam:Menit (HH:mm)
  const formatTime = (isoString: string | null | undefined) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Helper untuk memformat LocalDate menjadi Hari, Tanggal Bulan Tahun
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // Fungsi utama untuk menarik data dari API
  const fetchAttendance = useCallback(async () => {
    // Skip jika ini initial load dan sudah diproses
    if (initialLoadRef.current && isInitialized) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getAllAttendances(filter);
      setData(data);
      setCurrentPage(data.currentPage + 1);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentItem(data.currentItem);

      // Mark as initialized setelah sukses
      if (!isInitialized) {
        setIsInitialized(true);
        initialLoadRef.current = false;
      }
    } catch (err: any) {
      setError(
        err.message || "Terjadi kesalahan saat memproses data dari backend."
      );
    } finally {
      setLoading(false);
    }
  }, [filter, isInitialized]);

  // Hook untuk memicu pemanggilan data secara otomatis saat filter berubah
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Untuk debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilter((prev) => ({ ...prev, name: searchTerm, page: 0 }));
    }, 500); // Tunggu 500ms setelah user berhenti mengetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fungsi penanganan perubahan input pencarian
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 3. Tangani state loading dan error
  // if (loading) return <div>Memuat daftar absensi...</div>;
  if (error) return <div>Terjadi kesalahan: {error.message}</div>;

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Daftar Kehadiran" />
      <ComponentCard>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex text-xl m-5 items-center dark:text-gray-100">
            <Filter className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-100" />
            Filters & Controls
          </div>

          {/* Quick Date Picker */}
          <div className="m-5">
            <Label className="mb-2 block">Rentang Cepat</Label>
            <div className="flex flex-wrap gap-2">
              {quickDateOptions.map((option) => {
                // Tentukan apakah option ini aktif (default 30 hari)
                const isActive =
                  (option.value === "last30days" &&
                    startDate ===
                      format(subDays(new Date(), 29), "yyyy-MM-dd") &&
                    endDate === format(new Date(), "yyyy-MM-dd")) ||
                  (option.value !== "last30days" &&
                    option.value ===
                      getActiveQuickDateOption(startDate, endDate));

                return (
                  <button
                    key={option.value}
                    onClick={() => handleQuickDateSelect(option.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg shadow-theme-xs border focus:outline-hidden focus:ring-3 ${
                      isActive
                        ? "bg-brand-500 text-white border-brand-500 hover:bg-brand-600"
                        : "bg-transparent text-gray-800 border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:hover:bg-gray-800"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 m-5">
            {/* Date Range Picker */}
            <div>
              <DateRangePicker
                id="date-range"
                label="Rentang Tanggal"
                placeholder="Pilih rentang tanggal"
                maxRange={31}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                  setFilter((prev) => ({
                    ...prev,
                    startDate: start,
                    endDate: end,
                    page: 0,
                  }));
                }}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div>
              <Label>Departement</Label>
              <Select
                options={departmentOptions}
                defaultValue={
                  filter.role ? filter.role : filter.role === "" ? "ALL" : ""
                }
                placeholder="Pilih Departement"
                onChange={handleDepartmentChange}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                options={statusOptions}
                defaultValue={
                  filter.status
                    ? filter.status
                    : filter.status === ""
                    ? "ALL"
                    : ""
                }
                placeholder="Pilih Status"
                onChange={handleStatusChange}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label htmlFor="input">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  id="search"
                  className="pl-[35px]"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
        {startDate && endDate && (
          <div className="m-4 text-sm text-gray-600 dark:text-gray-400">
            Data absensi dari{" "}
            <span className="font-medium">
              {format(parseISO(startDate), "dd MMM yyyy", {
                locale: indonesianLocale,
              })}
            </span>{" "}
            hingga{" "}
            <span className="font-medium">
              {format(parseISO(endDate), "dd MMM yyyy", {
                locale: indonesianLocale,
              })}
            </span>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <span>Memuat data...</span>
            </div>
          )}

          <div className="max-w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium  text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Nama Karyawan
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Tanggal
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Absen Masuk
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Absen Pulang
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data?.attendances.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <img
                            width={40}
                            height={40}
                            src={order.userProfileImageUrl}
                            alt={order.userFullName}
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.userFullName}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {order.userEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(order.date)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatTime(order.checkinTime)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatTime(order.checkoutTime)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          order.status === "PRESENT"
                            ? "success"
                            : order.status === "LATE"
                            ? "warning"
                            : "error"
                        }
                      >
                        {order.status == "PRESENT"
                          ? "Tepat Waktu"
                          : order.status == "LATE"
                          ? "Terlambat"
                          : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Button
                        variant="ghost"
                        className="px-0 inline-flex items-center"
                        onClick={() => {
                          setSelectedAttendance(order);
                          openModal();
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-5 py-3 font-normal text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Showing {(currentPage - 1) * pageSize + 1} -{" "}
                        {Math.min(currentPage * pageSize, totalItems)} of{" "}
                        {totalItems}
                      </div>
                      <div className="flex items-center ">
                        <div className="relative flex items-center mr-2">
                          <div className="text-xs text-gray-500 px-2">
                            Items per page
                          </div>
                          <select
                            className="h-8 w-12 appearance-none rounded-lg border border-gray-300
                          bg-transparent px-2 py-1 pr-1 text-xs shadow-theme-xs focus:border-brand-300
                          focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700
                          dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800
                          text-gray-500 dark:text-gray-400"
                            onChange={(e) =>
                              handlePageSizeChange(e.target.value)
                            }
                          >
                            {/* Map over options */}
                            {pageSizeOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                className="text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 -right-0.5 flex items-center px-2 text-gray-700">
                            <svg
                              className="h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(1);
                            setFilter((prev) => ({ ...prev, page: 0 }));
                          }}
                          disabled={currentPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(currentPage - 1);
                            setFilter((prev) => ({
                              ...prev,
                              page: currentPage - 1 - 1,
                            }));
                          }}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs">
                          {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(currentPage + 1);
                            setFilter((prev) => ({
                              ...prev,
                              page: currentPage - 1 + 1,
                            }));
                          }}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(currentPage + 1);
                            setFilter((prev) => ({
                              ...prev,
                              page: totalPages - 1,
                            }));
                          }}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        {/* Attendance Detail Modal */}
        <Modal
          isOpen={isOpen}
          onClose={() => {
            closeModal();
            setSelectedAttendance(null);
          }}
          className="max-w-xl mx-4"
        >
          <div className="text-xs no-scrollbar relative w-full max-w-[700px]  overflow-y-auto p-4 md:p-5">
            {/* Header */}
            <div className="mb-2 p-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Attendance Detail
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Detail lengkap kehadiran karyawan
              </p>
            </div>

            <div className="custom-scrollbar overflow-y-auto max-h-[450px]">
              {/* Main Content Grid */}
              <div className="px-2 py-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Employee Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Employee Info Card */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">Employee</span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedAttendance?.userFullName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedAttendance?.userRole}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">Date</span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {/* {format(
                          parseISO(selectedAttendance?.date ? selectedAttendance.date : ""),
                          "EEEE, dd MMMM yyyy",
                          { locale: indonesianLocale }
                        )} */}
                          {selectedAttendance?.date}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="text-sm font-medium">Status</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="solid"
                            size="sm"
                            color={
                              selectedAttendance?.status === "PRESENT"
                                ? "success"
                                : selectedAttendance?.status === "LATE"
                                ? "warning"
                                : "error"
                            }
                          >
                            {selectedAttendance?.status == "PRESENT"
                              ? "Tepat Waktu"
                              : selectedAttendance?.status == "LATE"
                              ? "Terlambat"
                              : ""}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo & Location Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selfie Photo Card */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Foto
                          </h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <h1 className="text-xs font-medium m-1 text-gray-900 dark:text-white">
                          Absen Masuk
                        </h1>
                        {/* Check-in Photo */}
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex flex-col items-center justify-center">
                          {selectedAttendance?.checkinPhoto ? (
                            <img
                              src={selectedAttendance?.checkinPhoto.replace(
                                "/upload/",
                                "/upload/w_500,h_500,c_fill,g_face,f_auto,q_auto/"
                              )}
                              alt={selectedAttendance?.userFullName}
                              loading="lazy" // Optimasi: Hanya load saat dibutuhkan
                              className="w-full h-full p-2 rounded-xl object-cover"
                              onError={(e) =>
                                (e.currentTarget.src = "/default-avatar.png")
                              }
                            />
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              No Image
                            </span>
                          )}
                        </div>
                        <div className="my-3 text-center">
                          <Button
                            variant="outline"
                            disabled={
                              selectedAttendance?.checkinPhoto ? false : true
                            }
                            onClick={() =>
                              window.open(
                                selectedAttendance?.checkinPhoto,
                                "_blank"
                              )
                            }
                            size="sm"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-full"
                          >
                            View Full Image
                          </Button>
                        </div>

                        {/* Check-out Photo */}
                        <h1 className="text-xs font-medium m-1 text-gray-900 dark:text-white">
                          Absen Pulang
                        </h1>
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex flex-col items-center justify-center">
                          {selectedAttendance?.checkoutPhoto ? (
                            <img
                              src={selectedAttendance?.checkoutPhoto.replace(
                                "/upload/",
                                "/upload/w_500,h_500,c_fill,g_face,f_auto,q_auto/"
                              )}
                              alt={selectedAttendance?.userFullName}
                              loading="lazy" // Optimasi: Hanya load saat dibutuhkan
                              className="w-full h-full p-2 rounded-xl object-cover"
                              onError={(e) =>
                                (e.currentTarget.src = "/default-avatar.png")
                              }
                            />
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              No Image
                            </span>
                          )}
                        </div>

                        <div className="mt-3 text-center">
                          <Button
                            variant="outline"
                            disabled={
                              selectedAttendance?.checkoutPhoto ? false : true
                            }
                            onClick={() =>
                              window.open(
                                selectedAttendance?.checkoutPhoto
                                  ? selectedAttendance.checkoutPhoto
                                  : "",
                                "_blank"
                              )
                            }
                            size="sm"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-full"
                          >
                            View Full Image
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Location Details
                          </h3>
                        </div>
                      </div>

                      {/* Check-in Location */}
                      <div className="p-4">
                        <h1 className="text-xs font-medium m-1 text-gray-900 dark:text-white">
                          Lokasi Absen Masuk
                        </h1>
                        <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg flex items-center justify-center">
                          {selectedAttendance?.checkinLat &&
                          selectedAttendance?.checkinLng ? (
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://maps.google.com/maps?q=${selectedAttendance?.checkinLat},${selectedAttendance?.checkinLng}&z=16&output=embed`}
                              title="Google Maps Embed"
                              className="border-0 w-full h-full p-2 rounded-xl object-cover"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              No Location Data
                            </span>
                          )}
                        </div>
                        <div className="my-3 text-center">
                          <Button
                            variant="outline"
                            disabled={
                              selectedAttendance?.checkinLat &&
                              selectedAttendance?.checkinLng
                                ? false
                                : true
                            }
                            onClick={() =>
                              window.open(
                                `https://maps.google.com/maps?q=${selectedAttendance?.checkinLat},${selectedAttendance?.checkinLng}`,
                                "_blank"
                              )
                            }
                            size="sm"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 w-full"
                          >
                            Open in Google Maps
                          </Button>
                        </div>

                        {/* Check-out Location */}
                        <h1 className="text-xs font-medium m-1 text-gray-900 dark:text-white">
                          Lokasi Absen Keluar
                        </h1>
                        <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg flex items-center justify-center">
                          {selectedAttendance?.checkoutLat &&
                          selectedAttendance?.checkoutLng ? (
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://maps.google.com/maps?q=${selectedAttendance?.checkoutLat},${selectedAttendance?.checkoutLng}&z=16&output=embed`}
                              title="Google Maps Embed"
                              className="border-0"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              No Location Data
                            </span>
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <Button
                            variant="outline"
                            disabled={
                              selectedAttendance?.checkoutLat &&
                              selectedAttendance?.checkoutLng
                                ? false
                                : true
                            }
                            onClick={() =>
                              window.open(
                                `https://maps.google.com/maps?q=${selectedAttendance?.checkoutLat},${selectedAttendance?.checkoutLng}`,
                                "_blank"
                              )
                            }
                            size="sm"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 w-full"
                          >
                            Open in Google Maps
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Time & Actions */}
              <div className="px-2 py-2 space-y-6">
                {/* Time Tracking Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl ">
                  <div className="justify-items-center bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Waktu Kehadiran
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Absen Masuk
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatTime(selectedAttendance?.checkinTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Absen Pulang
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatTime(selectedAttendance?.checkoutTime) ||
                              "--:--"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>

                {/* Actions Card */}
                {/* <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Attendance Action
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Approve Attendance
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Mark as valid attendance
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Reject Attendance
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Requires justification
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 border-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>

                  {selectedAttendance?.status === "LATE" && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        ⚠️ This attendance is marked as late. Please review
                        before approving.
                      </p>
                    </div>
                  )}
                </div> */}
              </div>
            </div>

            {/* Footer Notes */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created at:{" "}
                {new Date(
                  selectedAttendance?.createdAt
                    ? selectedAttendance.createdAt
                    : ""
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}{" "}
                • Last updated:{" "}
                {new Date(
                  selectedAttendance?.updatedAt
                    ? selectedAttendance.updatedAt
                    : ""
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}{" "}
                • Record ID: {selectedAttendance?.id}
              </p>
            </div>
          </div>
        </Modal>
      </ComponentCard>
    </>
  );
}

// Helper function untuk menentukan quick date option yang aktif
const getActiveQuickDateOption = (
  startDate: string,
  endDate: string
): string => {
  const today = format(new Date(), "yyyy-MM-dd");

  if (startDate === today && endDate === today) return "today";
  if (
    startDate === format(subDays(new Date(), 1), "yyyy-MM-dd") &&
    endDate === startDate
  )
    return "yesterday";
  if (
    startDate === format(subDays(new Date(), 6), "yyyy-MM-dd") &&
    endDate === today
  )
    return "last7days";
  if (
    startDate === format(subDays(new Date(), 29), "yyyy-MM-dd") &&
    endDate === today
  )
    return "last30days";
  if (
    startDate === format(startOfMonth(new Date()), "yyyy-MM-dd") &&
    endDate === today
  )
    return "thisMonth";
  if (
    startDate ===
      format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd") &&
    endDate === format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd")
  )
    return "lastMonth";

  return "";
};
