import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import UserMetaCard from "../../components/UserProfile/UserMetaCard";
// import UserInfoCard from "../../components/UserProfile/UserInfoCard";
// import UserAddressCard from "../../components/UserProfile/UserAddressCard";
import PageMeta from "../../components/common/PageMeta";
import { 
  useParams,
  // useNavigate
 } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { User, userApi } from "../../api/userApi";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useModal } from "../../hooks/useModal";

export default function EmployeeProfile() {
  const { id } = useParams();
  // const navigate = useNavigate();

  // 1. Definisikan state untuk data, loading, dan error
  const [data, setData] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // --- STATE UNTUK FORM EDIT ---
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // 2. Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        const userData = await userApi.getUserById(Number(id));
        setData(userData);
        // Inisialisasi formData dengan data yang baru di-fetch
        setFormData(userData);
      } catch (err) {
        setError(err as Error);
      } finally {
        // setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle perubahan file (untuk preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file)); // Buat URL sementara untuk preview
    }
  };

  // Fungsi Save ke API
  // Update fungsi handleSave untuk menggunakan FormData
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);

      const formDataToSend = new FormData();

      // Jika ada file baru, masukkan ke FormData
      if (selectedFile) {
        formDataToSend.append("profilePicture", selectedFile);
      }

      // Masukkan field lainnya
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Jika field berupa array (seperti roles), stringify dulu
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      // Pastikan API updateUser Anda sekarang menerima FormData
      const updatedUser = await userApi.updateUser(Number(id), formDataToSend);

      setData(updatedUser);
      alert("Profil berhasil diperbarui!");
      closeModal();
      // Reset state file setelah sukses
      setSelectedFile(null);
      setPhotoPreview(null);
    } catch (err) {
      console.error("Gagal mengupdate:", err);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Tambahkan fungsi reset saat modal ditutup
  const handleCloseModal = () => {
    setPhotoPreview(null);
    setSelectedFile(null);
    closeModal();
  };

  // Modal state
  const { isOpen, openModal, closeModal } = useModal();

  // 3. Handle loading and error states
  if (error) return <div>Terjadi kesalahan: {error.message}</div>;

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb
        pageTitle="Employee Profile"
        pageCrumb={data?.fullName || "Loading..."}
        items={[{ label: "Manajemen Karyawan", to: "/manajemen-karyawan" }]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          {/* User Meta Card Section */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <img src={data?.profileImageUrl} alt={data?.fullName} />
                </div>
                <div className="order-3 xl:order-2">
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {data?.fullName}
                  </h4>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data ? data.roles[0] : "Departemen Karyawan"}
                    </p>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data ? data.roles[0] : "Jabatan Karyawan"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={openModal}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-40"
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                    fill=""
                  />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* User Info Card Section */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      First Name
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {data?.firstName}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Last Name
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {data?.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Email address
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {data?.email}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {data?.phoneNumber || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {data?.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Address Card Section */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  Address
                </h4>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Country
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      United States.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      City/State
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Phoenix, Arizona, United States.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Postal Code
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      ERT 2489
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      TAX ID
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      AS4568384
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {/* --- BAGIAN EDIT FOTO PROFIL BARU --- */}
              <div className="mb-8">
                <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Profile Photo
                </h5>
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                    <img
                      src={
                        photoPreview ||
                        data?.profileImageUrl
                      }
                      alt="Profile Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    <p className="mt-2 text-xs text-gray-500">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Personal Information Section*/}
              <div className="">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      name="firstName"
                      type="text"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input
                      name="lastName"
                      type="text"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input
                      name="email"
                      type="text"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input
                      name="phoneNumber"
                      type="text"
                      value={formData.phoneNumber || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input
                      name="bio"
                      type="text"
                      // value={formData.bio || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Address Section*/}
              <div className="mt-7">
                <div className="px-2 pr-14">
                  <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Edit Address
                  </h4>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                    Update your details to keep your profile up-to-date.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Country</Label>
                    <Input type="text" value="United States" />
                  </div>

                  <div>
                    <Label>City/State</Label>
                    <Input type="text" value="Arizona, United States." />
                  </div>

                  <div>
                    <Label>Postal Code</Label>
                    <Input type="text" value="ERT 2489" />
                  </div>

                  <div>
                    <Label>TAX ID</Label>
                    <Input type="text" value="AS4568384" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <Button size="sm" type="submit">
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
