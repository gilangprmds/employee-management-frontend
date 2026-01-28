import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { 
  userApi, 
  // User, 
  CreateUserPayload } from "../../api/userApi";

export default function AddEmployee() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Foto
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State untuk Form
  const [formData, setFormData] = useState<Partial<CreateUserPayload>>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    roleCodes: [""],
  });

  // Handle Upload Foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Gunakan FormData jika API Anda menerima file
      const request = new FormData();
      if (selectedFile) {
        request.append("profilePicture", selectedFile);
      }

      // Tambahkan field lainnya ke FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "roleCodes") {
          // request.append(key, JSON.stringify(value));
        } else {
          request.append(key, value as string);
        }
      });

      // Sesuaikan pemanggilan API Anda (Pastikan API mendukung FormData)
      await userApi.createUser(request);

      alert("Karyawan berhasil ditambahkan!");
      navigate("/manajemen-karyawan");
    } catch (err) {
      console.error("Gagal menambah karyawan:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Add Employee | Employee Attendance Dashboard"
        description="Tambah karyawan baru"
      />
      <PageBreadcrumb
        pageTitle="Tambah Karyawan"
        pageCrumb="Tambah Baru"
        items={[{ label: "Manajemen Karyawan", to: "/manajemen-karyawan" }]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Personal Information */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
              Informasi Pribadi
            </h4>

            {/* FOTO UPLOAD SECTION */}
            <div className="flex flex-col items-center gap-5 mb-8 xl:flex-row">
              <div className="relative w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
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
                  onClick={triggerFileInput}
                >
                  Pilih Foto
                </Button>
                <p className="text-xs text-gray-500">
                  JPG, PNG atau GIF. Maksimal 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Nama Depan</Label>
                <Input
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label>Nama Belakang</Label>
                <Input
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label>Nomor Telepon</Label>
                <Input
                  name="phoneNumber"
                  type="text"
                  placeholder="+62..."
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Jabatan</Label>
                <Input
                  name="roleCodes"
                  type="text"
                  placeholder="UI/UX Designer"
                  value={formData.roleCodes?.[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, roleCodes: [e.target.value] })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section: Address Information */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
              Informasi Alamat
            </h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Negara</Label>
                <Input
                  name="country"
                  type="text"
                  placeholder="Indonesia"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Kota</Label>
                <Input
                  name="city"
                  type="text"
                  placeholder="Jakarta"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/manajemen-karyawan")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
