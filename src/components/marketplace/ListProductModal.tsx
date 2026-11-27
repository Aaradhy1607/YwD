"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
  Package,
  Camera,
  CheckCircle2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { validateImageUrl } from "@/lib/image-utils";

interface ListProductModalProps {
  categories: any[];
  onClose: () => void;
  onSuccess: (newProduct: any) => void;
}

export function ListProductModal({
  categories,
  onClose,
  onSuccess,
}: ListProductModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [conditionGrade, setConditionGrade] = useState("Mint (Like New)");
  const [listingType, setListingType] = useState<"rent" | "sell" | "both" | null>(null);
  const [rentalPriceDaily, setRentalPriceDaily] = useState("299");
  const [rentalPriceWeekly, setRentalPriceWeekly] = useState("1299");
  const [rentalPriceHourly, setRentalPriceHourly] = useState("60");
  const [rentalPriceMonthly, setRentalPriceMonthly] = useState("3999");
  const [rentalPriceSemester, setRentalPriceSemester] = useState("8999");
  const [deposit, setDeposit] = useState("2500");
  const [mrpReference, setMrpReference] = useState("24999");
  const [buyPrice, setBuyPrice] = useState("");
  const [campusHub, setCampusHub] = useState("Central Verified Locker • Hub A");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);

  // Images list (empty by default — never pre-filled with a preset photo)
  const [images, setImages] = useState<string[]>([]);
  const [imageStatuses, setImageStatuses] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({});
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Specifications
  const [specList, setSpecList] = useState<{ key: string; value: string }[]>([
    { key: "Brand", value: "Apple" },
    { key: "Warranty", value: "Verified Active" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cloudinary image file upload handler (supports multiple files & safe retry)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageError(null);
    setUploadSuccessMsg(null);
    setUploading(true);

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    let uploadedCount = 0;

    try {
      for (const file of files) {
        if (!validTypes.includes(file.type)) {
          setImageError(
            `"${file.name}" is not a supported format. Use JPEG, PNG, WEBP, or AVIF.`
          );
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setImageError(`"${file.name}" exceeds the 5MB upload limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok || !data?.url) {
          setImageError(
            data?.error ||
              "Failed to upload image. Please retry or paste a direct HTTPS image URL."
          );
          continue;
        }

        const uploadedUrl: string = data.url;
        setImages((prev) => (prev.includes(uploadedUrl) ? prev : [...prev, uploadedUrl]));
        setImageStatuses((prev) => ({ ...prev, [uploadedUrl]: "loading" }));
        uploadedCount += 1;
      }

      if (uploadedCount > 0) {
        setUploadSuccessMsg(
          uploadedCount === 1
            ? "Photo uploaded successfully."
            : `${uploadedCount} photos uploaded successfully.`
        );
      }
    } catch (err: any) {
      setImageError(
        err?.message ||
          "Network error while uploading image. You can retry without losing your form."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    setImageError(null);
    setUploadSuccessMsg(null);

    const validation = validateImageUrl(newImageUrl);
    if (!validation.valid) {
      setImageError(validation.error);
      return;
    }

    if (images.includes(validation.url)) {
      setImageError("This image URL has already been added.");
      return;
    }

    setImages((prev) => [...prev, validation.url]);
    setImageStatuses((prev) => ({ ...prev, [validation.url]: "loading" }));
    setNewImageUrl("");
  };

  const handleRemoveImage = (idx: number) => {
    const removedUrl = images[idx];
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (removedUrl) {
      setImageStatuses((prev) => {
        const next = { ...prev };
        delete next[removedUrl];
        return next;
      });
    }
    setImageError(null);
  };

  const handleAddSpec = () => {
    setSpecList((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (!listingType) {
        throw new Error("Please select what you would like to do with this item (Rent, Sell, or Both).");
      }

      const showRent = listingType === "rent" || listingType === "both";
      const showSell = listingType === "sell" || listingType === "both";

      const dailyVal = parseFloat(rentalPriceDaily);
      const weeklyVal = parseFloat(rentalPriceWeekly);
      const depositVal = parseFloat(deposit);
      const mrpVal = mrpReference ? parseFloat(mrpReference) : NaN;
      const sellVal = parseFloat(buyPrice);

      if (showRent) {
        if (Number.isNaN(dailyVal) || dailyVal < 1) {
          throw new Error("Please enter a valid daily rental rate (minimum ₹1).");
        }
        if (Number.isNaN(weeklyVal) || weeklyVal < 1) {
          throw new Error("Please enter a valid weekly rental rate (minimum ₹1).");
        }
        if (Number.isNaN(depositVal) || depositVal < 0) {
          throw new Error("Please enter a valid security deposit (₹0 or more).");
        }
        if (Number.isNaN(mrpVal) || mrpVal < 1) {
          throw new Error("Please enter a valid original retail MRP reference.");
        }
      }

      if (showSell) {
        if (Number.isNaN(sellVal) || sellVal < 1) {
          throw new Error("Please enter a valid selling price (minimum ₹1).");
        }
      }

      if (images.length === 0) {
        throw new Error("Please upload a photo or add at least one direct image URL.");
      }

      const validImages = images.filter((url) => imageStatuses[url] !== "error");
      if (validImages.length === 0) {
        throw new Error(
          "None of the added image URLs could be loaded. Remove broken links and add a valid direct image URL or upload a photo."
        );
      }

      const specsObj: Record<string, string> = {};
      specList.forEach((s) => {
        if (s.key.trim() && s.value.trim()) {
          specsObj[s.key.trim()] = s.value.trim();
        }
      });

      const payload = {
        title,
        description,
        categoryId: categoryId || categories[0]?.id,
        conditionGrade,
        listingType,
        rentalPriceDaily: showRent ? dailyVal : 0,
        rentalPriceWeekly: showRent ? weeklyVal : 0,
        rentalPriceHourly: showRent && rentalPriceHourly ? parseFloat(rentalPriceHourly) : null,
        rentalPriceMonthly: showRent && rentalPriceMonthly ? parseFloat(rentalPriceMonthly) : null,
        rentalPriceSemester: showRent && rentalPriceSemester ? parseFloat(rentalPriceSemester) : null,
        mrpReference: !Number.isNaN(mrpVal) && mrpVal > 0 ? mrpVal : showSell ? sellVal : 0,
        deposit: showRent ? depositVal : 0,
        isRentable: showRent,
        isPurchasable: showSell,
        buyPrice: showSell ? sellVal : null,
        campusHub,
        pickupAddress,
        pickupAvailable,
        deliveryAvailable,
        images: validImages,
        specs: specsObj,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing.");
      }

      onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save listing.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202522]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#18352D] text-[#F5F0E8] px-6 py-4 flex items-center justify-between border-b border-[#2C483F] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FAF7F2] border border-white/20 shrink-0 shadow-xs">
              <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold tracking-wide text-white block">
                YwD // LIST EQUIPMENT PROTOCOL
              </span>
              <span className="text-[10px] text-[#9BB5A3]">
                Your personal details remain 100% confidential
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F0E8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#FFFFFF]">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#18352D] block mb-1.5">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apple iPad Pro 11-inch M2 (128GB, Space Grey) with Apple Pencil 2"
                className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm text-[#18352D] focus:outline-none focus:border-[#18352D]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#18352D] block mb-1.5">
                Detailed Condition & Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe included accessories, cosmetic state, battery health, and recommended use cases..."
                className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm text-[#18352D] focus:outline-none focus:border-[#18352D]"
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#18352D] block mb-1.5">
                Equipment Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm text-[#18352D] font-medium focus:outline-none focus:border-[#18352D]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#18352D] block mb-1.5">
                Condition Grade *
              </label>
              <select
                value={conditionGrade}
                onChange={(e) => setConditionGrade(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm text-[#18352D] font-medium focus:outline-none focus:border-[#18352D]"
              >
                <option value="Mint (Like New)">Mint (Like New - Flawless)</option>
                <option value="Excellent">Excellent (Minor signs of handling)</option>
                <option value="Very Good">Very Good (Light cosmetic scuffs)</option>
                <option value="Good">Good (Fully functional, visible wear)</option>
              </select>
            </div>
          </div>

          {/* Listing Intent Selection: Rent / Sell / Both */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E5DEC9] space-y-4">
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-[#18352D]">
                What would you like to do with this item? *
              </h4>
              <p className="text-[11px] text-[#63736A] mt-0.5">
                Choose whether peers can rent it, buy it outright, or both.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: "rent" as const,
                  title: "Rent",
                  subtitle: "Earn per day/week with escrow deposit",
                },
                {
                  id: "sell" as const,
                  title: "Sell",
                  subtitle: "Outright recommerce sale",
                },
                {
                  id: "both" as const,
                  title: "Both — Rent and Sell",
                  subtitle: "Set rental rates & outright buy price",
                },
              ].map((option) => {
                const selected = listingType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setListingType(option.id);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    aria-pressed={selected}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selected
                        ? "bg-[#18352D] text-white border-[#18352D] shadow-xs"
                        : "bg-[#FFFFFF] text-[#18352D] border-[#E5DEC9] hover:border-[#18352D]/50"
                    }`}
                  >
                    <span className="text-xs font-semibold block">{option.title}</span>
                    <span
                      className={`text-[11px] mt-0.5 block ${
                        selected ? "text-[#D6E0D9]" : "text-[#63736A]"
                      }`}
                    >
                      {option.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {!listingType && (
              <p className="text-[11px] text-[#C46A42] font-medium">
                Select one of the options above to enter pricing details.
              </p>
            )}

            {(listingType === "rent" || listingType === "both") && (
              <div className="space-y-4 pt-2 border-t border-[#E5DEC9]">
                <h5 className="font-semibold text-xs text-[#18352D] uppercase tracking-wider">
                  Transparent Duration Rates & Escrow Deposit
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                      Daily Rate (₹) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={rentalPriceDaily}
                      onChange={(e) => setRentalPriceDaily(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                      Weekly Rate (₹) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={rentalPriceWeekly}
                      onChange={(e) => setRentalPriceWeekly(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                      Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rentalPriceHourly}
                      onChange={(e) => setRentalPriceHourly(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                      Monthly Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rentalPriceMonthly}
                      onChange={(e) => setRentalPriceMonthly(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                      Semester Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rentalPriceSemester}
                      onChange={(e) => setRentalPriceSemester(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                      Escrow Deposit (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                    />
                  </div>
                </div>
              </div>
            )}

            {(listingType === "sell" || listingType === "both") && (
              <div className="space-y-3 pt-2 border-t border-[#E5DEC9]">
                <h5 className="font-semibold text-xs text-[#18352D] uppercase tracking-wider">
                  Outright Selling Price
                </h5>
                <div>
                  <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    placeholder="e.g. 18500"
                    className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                  />
                </div>
              </div>
            )}

            {listingType && (
              <div className="pt-2 border-t border-[#E5DEC9]">
                <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                  Original Retail MRP Reference (₹) {listingType !== "sell" ? "*" : "(Optional)"}
                </label>
                <input
                  type="number"
                  min={listingType !== "sell" ? "1" : "0"}
                  required={listingType !== "sell"}
                  value={mrpReference}
                  onChange={(e) => setMrpReference(e.target.value)}
                  className="w-full sm:w-1/2 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs sm:text-sm font-mono font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                />
              </div>
            )}
          </div>

          {/* Product Photography Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#18352D] block">
              Equipment Photographs (Minimum 1 Required) *
            </label>

            <div className="flex flex-wrap gap-2.5 items-center">
              {images.length === 0 && (
                <div className="h-20 px-4 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] flex items-center gap-2 text-[#63736A] text-[11px]">
                  <Package className="w-4 h-4 text-[#9BB5A3] shrink-0" />
                  <span>No photos added yet. Upload a photo or paste a direct image URL below.</span>
                </div>
              )}

              {images.map((url, idx) => {
                const status = imageStatuses[url] || "loading";
                return (
                  <div
                    key={url}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border bg-[#FAF7F2] group ${
                      status === "error" ? "border-rose-300 bg-rose-50" : "border-[#E5DEC9]"
                    }`}
                  >
                    {status === "error" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center text-rose-700">
                        <AlertCircle className="w-4 h-4 mb-0.5 shrink-0" />
                        <span className="text-[9px] font-semibold leading-tight">
                          Failed to load
                        </span>
                      </div>
                    ) : (
                      <>
                        {status === "loading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF7F2]">
                            <span className="w-4 h-4 border-2 border-[#18352D]/25 border-t-[#18352D] rounded-full animate-spin" />
                          </div>
                        )}
                        <img
                          src={url}
                          alt={`Listing upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onLoad={() =>
                            setImageStatuses((prev) => ({ ...prev, [url]: "loaded" }))
                          }
                          onError={() => {
                            setImageStatuses((prev) => ({ ...prev, [url]: "error" }));
                            setImageError(
                              "One or more image URLs could not be loaded as an image. Make sure it is a direct image link (not a webpage) and is publicly accessible."
                            );
                          }}
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      aria-label={`Remove image ${idx + 1}`}
                      className="absolute inset-0 bg-[#202522]/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              <label
                className={`w-20 h-20 rounded-xl border-2 border-dashed border-[#E5DEC9] hover:border-[#18352D] flex flex-col items-center justify-center text-[#63736A] cursor-pointer transition-colors bg-[#FAF7F2] ${
                  uploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {uploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#18352D]/25 border-t-[#18352D] rounded-full animate-spin" />
                    <span className="text-[10px] mt-1">Uploading</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-[#789681]" />
                    <span className="text-[10px] mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  disabled={uploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {imageError && (
              <div
                role="alert"
                className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-start gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{imageError}</span>
              </div>
            )}

            {uploadSuccessMsg && !imageError && (
              <div
                role="status"
                className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  if (imageError) setImageError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                placeholder="Or paste direct image URL (https://...)"
                className="flex-1 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-none focus:border-[#18352D]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3.5 py-2 rounded-xl bg-[#18352D] text-white text-xs font-semibold hover:bg-[#234C40] transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#18352D]">
                Key Hardware Specifications
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs font-semibold text-[#C46A42] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add spec field</span>
              </button>
            </div>

            <div className="space-y-2">
              {specList.map((spec, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => {
                      const updated = [...specList];
                      updated[idx].key = e.target.value;
                      setSpecList(updated);
                    }}
                    placeholder="Feature (e.g. RAM, Lens Mount)"
                    className="flex-1 p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-none focus:border-[#18352D]"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => {
                      const updated = [...specList];
                      updated[idx].value = e.target.value;
                      setSpecList(updated);
                    }}
                    placeholder="Value (e.g. 16GB, Sony E-Mount)"
                    className="flex-1 p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-none focus:border-[#18352D]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-2 text-[#63736A] hover:text-[#A64F45]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Handover Facility */}
          <div>
            <label className="text-xs font-semibold text-[#18352D] block mb-1.5">
              Designated Handover Station *
            </label>
            <select
              value={campusHub}
              onChange={(e) => setCampusHub(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm text-[#18352D] font-medium focus:outline-none focus:border-[#18352D]"
            >
              <option value="Central Verified Locker • Hub A">Central Verified Locker • Hub A (24/7 Contactless)</option>
              <option value="Technology & Equipment Desk • Point 1">Technology & Equipment Desk • Point 1</option>
              <option value="Academic & Media Center Handover Point">Academic & Media Center Handover Point</option>
              <option value="Studio & Audio Visual Collection Point">Studio & Audio Visual Collection Point</option>
              <option value="Express Handover Bay • Zone 2">Express Handover Bay • Zone 2</option>
            </select>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#E5DEC9] text-xs font-semibold text-[#63736A] hover:bg-[#FAF7F2] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-3 rounded-full bg-[#C46A42] hover:bg-[#A8532F] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {submitting ? (
                <span>Publishing Listing...</span>
              ) : (
                <span>Publish Listing to Marketplace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
