import logoUrl from "@/assets/logo.webp";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Info, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionWithExpiration } from "@/types/user";
import { getCountryFromIP } from "@/services/ipLocationService";

interface Subscription extends SubscriptionWithExpiration {
  endDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
  status: string;
  paymentGateway: string;
  orderId: string;
  paymentId: string;
  createdAt: string;
}

interface SubscriptionHistorySectionProps {
  userSubscriptions: Subscription[];
  loading?: boolean;
  error?: string | null;
  user?: any;
}

export function SubscriptionHistorySection({
  userSubscriptions = [],
  loading = false,
  error = null,
  user,
}: SubscriptionHistorySectionProps) {
  const [detailSub, setDetailSub] = useState<Subscription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  // Default to INR - will be updated by useEffect if needed
  const [currencySymbol, setCurrencySymbol] = useState<"₹" | "$">("₹");
  const [currencyCode, setCurrencyCode] = useState<"INR" | "USD">("INR");

  // Detect currency on mount using your backend API
  useEffect(() => {
    const checkCurrency = async () => {
      try {
        const countryCode = await getCountryFromIP();

        if (countryCode === "IN") {
          setCurrencySymbol("₹");
          setCurrencyCode("INR");
        } else {
          setCurrencySymbol("$");
          setCurrencyCode("USD");
        }
      } catch (error) {
        console.warn("Currency detection failed, using INR");
        setCurrencySymbol("₹");
        setCurrencyCode("INR");
      }
    };

    checkCurrency();
  }, []);

  const openSubDetail = (sub: Subscription) => {
    setDetailSub(sub);
    setIsDetailModalOpen(true);
  };

  const handleDownloadInvoice = async (sub: Subscription) => {
    setDownloadingId(sub._id);
    try {
      const html2canvasModule = await import("html2canvas");
      const jsPDFModule = await import("jspdf");
      const html2canvas = html2canvasModule.default;
      const jsPDF = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;

      // Convert logo to base64 so html2canvas can embed it
      const logoBase64 = await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d")!.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = logoUrl;
      });

      const amount = (sub.finalAmount ?? sub.amount ?? 0).toLocaleString();
      const discount = sub.discountAmount
        ? sub.discountAmount.toLocaleString()
        : "0";
      const invoiceDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const startDate = sub.startDate
        ? new Date(sub.startDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "N/A";
      const endDate = sub.endDate
        ? new Date(sub.endDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "N/A";

      const invoiceHTML = `
        <div style="font-family: Arial, sans-serif; background: white; padding: 40px; width: 760px; color: #1a1a1a;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="${logoBase64}" style="width:160px;height:auto;" />
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 18px; font-weight: 700; margin: 0;">Tanish Physio</h2>
              <p style="color: #6b7280; margin: 2px 0;">Physical Therapy &amp; Rehabilitation</p>
              <p style="color: #6b7280; margin: 0;">India</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
            <div>
              <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 8px;">Bill To:</h3>
              <p style="font-weight: 600; margin: 0;">${user?.name || "N/A"}</p>
              <p style="color: #6b7280; margin: 2px 0;">${user?.email || "N/A"}</p>
              <p style="color: #6b7280; margin: 0;">${user?.phone || "N/A"}</p>
            </div>
            <div style="text-align: right;">
              <div style="margin-bottom: 12px;">
                <p style="color: #6b7280; margin: 0;">Invoice Date:</p>
                <p style="font-weight: 600; margin: 2px 0;">${invoiceDate}</p>
              </div>
              <div>
                <p style="color: #6b7280; margin: 0;">Subscription Period:</p>
                <p style="font-weight: 600; margin: 2px 0;">${startDate} — ${endDate}</p>
              </div>
            </div>
          </div>

          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background: #f9fafb;">
                <tr>
                  <th style="text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 700;">Description</th>
                  <th style="text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 700;">Period</th>
                  <th style="text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 700;">Sessions</th>
                  <th style="text-align: right; padding: 12px 16px; font-size: 13px; font-weight: 700;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px 16px; border-top: 1px solid #e5e7eb;">
                    <div style="font-weight: 600;">${sub.planName}</div>
                    <div style="color: #6b7280; font-size: 13px;">Subscription Plan</div>
                    ${sub.couponCode ? `<div style="color: #059669; font-size: 12px; margin-top: 2px;">Coupon: ${sub.couponCode}</div>` : ""}
                  </td>
                  <td style="padding: 12px 16px; border-top: 1px solid #e5e7eb; color: #374151;">
                    <div>${startDate}</div>
                    <div style="color: #6b7280; font-size: 13px;">to ${endDate}</div>
                  </td>
                  <td style="padding: 12px 16px; border-top: 1px solid #e5e7eb;">
                    ${sub.availableSessions ? `<div>${sub.availableSessions.used}/${sub.availableSessions.total} used</div><div style="color: #6b7280; font-size: 13px;">${sub.availableSessions.remaining} remaining</div>` : "<div style='color:#9ca3af;'>N/A</div>"}
                  </td>
                  <td style="padding: 12px 16px; border-top: 1px solid #e5e7eb; text-align: right; font-weight: 700;">
                    &#8377;${amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
            <div>
              <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 8px;">Payment Method</h3>
              <p style="color: #6b7280; margin: 0;">${sub.paymentGateway || "Online Payment"}</p>
              ${sub.orderId ? `<p style="color:#9ca3af; font-size: 12px; margin: 4px 0 0;">Order: ${sub.orderId}</p>` : ""}
              ${sub.paymentId ? `<p style="color:#9ca3af; font-size: 12px; margin: 2px 0 0;">Payment: ${sub.paymentId}</p>` : ""}
            </div>
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Subtotal:</span><span>&#8377;${(sub.amount ?? 0).toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Discount:</span><span style="color: #059669;">&#8377;${discount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Tax:</span><span>&#8377;0.00</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 16px; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 4px;">
                <span>Total:</span><span>&#8377;${amount}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p style="margin: 0;">Thank you for choosing Tanish Physio for your healthcare needs.</p>
            <p style="margin: 6px 0 0;">For any inquiries, please contact our support team.</p>
          </div>
        </div>
      `;

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = "800px";
      tempDiv.style.backgroundColor = "white";
      tempDiv.innerHTML = invoiceHTML;
      document.body.appendChild(tempDiv);

      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `invoice-${sub.planName?.replace(/\s+/g, "-").toLowerCase() || "subscription"}-${sub._id?.slice(-6)}.pdf`,
      );
    } catch (err) {
      console.error("Invoice download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };
  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase">
            Subscription History
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Complete history of your subscriptions
          </p>
        </div>
        <Card className="p-10 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase">
            Subscription History
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Complete history of your subscriptions
          </p>
        </div>
        <Card className="p-10 text-center">
          <div className="text-red-500">
            <FileText className="mx-auto h-10 w-10" />
            <h3 className="mt-4 text-lg font-bold">Error Loading Data</h3>
            <p className="text-slate-500">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const isSubscriptionExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate).getTime() < Date.now();
  };

  const getDaysUntilExpiry = (endDate?: string) => {
    if (!endDate) return null;
    return Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase">
          Subscription History
        </h2>
        <p className="text-slate-500 font-medium text-sm">
          Complete history of your subscriptions
        </p>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block">
        {userSubscriptions?.length > 0 ? (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Sessions
                    </th>

                    {/* <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Payment
                    </th> */}
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {userSubscriptions.map((p: Subscription) => (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Plan */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {p.planName}
                        </div>
                        <div className="text-xs text-slate-400">
                          Plan ID: {p.planId}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        <div>
                          Start:{" "}
                          {p.startDate
                            ? new Date(p.startDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </div>
                        <div>
                          End:{" "}
                          {p.endDate
                            ? new Date(p.endDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <div className="text-right">
                          <span className="font-black text-slate-900">
                            {currencySymbol}
                            {(p.finalAmount?.toLocaleString() ??
                              p.amount?.toLocaleString()) ||
                              0}
                          </span>
                          {/* {p.discountAmount > 0 && (
                            <div className="text-slate-500 text-sm line-through">
                              {currencySymbol}{p.amount?.toLocaleString()}
                            </div>
                          )} */}
                          {p.couponCode && (
                            <div className="text-success text-xs font-medium mt-1">
                              Coupon: {p.couponCode}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sessions */}
                      <td className="px-6 py-4 text-center">
                        {p.availableSessions ? (
                          <div className="text-sm font-bold space-y-1">
                            <div>
                              {p.availableSessions.used}/
                              {p.availableSessions.total}
                            </div>

                            <div className="font-bold text-primary">
                              Left: {p.availableSessions.remaining}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs">N/A</div>
                        )}
                      </td>

                      {/* Payment */}
                      {/* <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-slate-900">
                          {p.paymentGateway || "N/A"}
                        </div>
                        <div className="text-slate-400 text-xs">
                          Order: {p.orderId ? p.orderId.slice(-8) : "N/A"}
                        </div>
                        <div className="text-slate-400 text-xs">
                          Pay ID: {p.paymentId ? p.paymentId.slice(-8) : "N/A"}
                        </div>
                      </td> */}

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const expired = isSubscriptionExpired(p.endDate);
                          const daysLeft = getDaysUntilExpiry(p.endDate);

                          return (
                            <div className="space-y-1 flex flex-col items-center">
                              {/* MAIN STATUS */}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-black uppercase
            ${
              expired
                ? "bg-red-100 text-red-700"
                : p.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
            }
          `}
                              >
                                {expired ? "EXPIRED" : p.status || "UNKNOWN"}
                              </span>

                              {/* EXPIRY INFO */}
                              {p.endDate &&
                                (expired ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                                    Expired on{" "}
                                    {new Date(p.endDate).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                ) : daysLeft !== null && daysLeft <= 7 ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    Expires in {daysLeft} day
                                    {daysLeft > 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                    Valid till{" "}
                                    {new Date(p.endDate).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                ))}

                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-bold text-slate-500 hover:text-primary hover:bg-primary/10 mt-1 h-7 px-2 text-xs"
                                onClick={() => openSubDetail(p)}
                              >
                                <Info className="h-3 w-3 mr-1" />
                                Read More
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-bold text-slate-500 hover:text-green-700 hover:bg-green-50 mt-1 h-7 px-2 text-xs"
                                onClick={() => handleDownloadInvoice(p)}
                                disabled={downloadingId === p._id}
                              >
                                {downloadingId === p._id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3 mr-1" />
                                )}
                                {downloadingId === p._id
                                  ? "Generating..."
                                  : "Invoice"}
                              </Button>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-black text-slate-900">
              No Subscription History
            </h3>
            <p className="text-slate-500 font-medium mt-2">
              You haven't purchased any plans yet.
            </p>
          </Card>
        )}
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden">
        {userSubscriptions?.length > 0 ? (
          <div className="space-y-4">
            {userSubscriptions.map((p: Subscription) => (
              <Card
                key={p._id}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {p.planName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Plan ID: {p.planId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">
                        {currencySymbol}
                        {p.amount?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Start Date</p>
                      <p className="text-sm text-slate-900">
                        {p.startDate
                          ? new Date(p.startDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">End Date</p>
                      <p className="text-sm text-slate-900">
                        {p.endDate
                          ? new Date(p.endDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="space-y-1 flex flex-col">
                      {(() => {
                        const expired = isSubscriptionExpired(p.endDate);
                        const daysLeft = getDaysUntilExpiry(p.endDate);

                        return (
                          <>
                            {/* MAIN STATUS */}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-black uppercase
                                ${
                                  expired
                                    ? "bg-red-100 text-red-700"
                                    : p.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }
                              `}
                            >
                              {expired ? "EXPIRED" : p.status || "UNKNOWN"}
                            </span>

                            {/* EXPIRY INFO */}
                            {p.endDate &&
                              (expired ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                                  Expired on{" "}
                                  {new Date(p.endDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              ) : daysLeft !== null && daysLeft <= 7 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                  Expires in {daysLeft} day
                                  {daysLeft > 1 ? "s" : ""}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                  Valid till{" "}
                                  {new Date(p.endDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {p.availableSessions && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Used</p>
                          <p className="text-sm font-bold text-slate-900">
                            {p.availableSessions.used}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-sm font-bold text-slate-900">
                            {p.availableSessions.total}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Left</p>
                          <p className="text-sm font-bold text-primary">
                            {p.availableSessions.remaining}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-bold text-slate-500 hover:text-primary hover:bg-primary/10 flex-1 h-8 text-xs"
                      onClick={() => openSubDetail(p)}
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Read More
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-bold text-slate-500 hover:text-green-700 hover:bg-green-50 flex-1 h-8 text-xs"
                      onClick={() => handleDownloadInvoice(p)}
                      disabled={downloadingId === p._id}
                    >
                      {downloadingId === p._id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      {downloadingId === p._id ? "Generating..." : "Invoice"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-black text-slate-900">
              No Subscription History
            </h3>
            <p className="text-slate-500 font-medium mt-2">
              You haven't purchased any plans yet.
            </p>
          </Card>
        )}
      </div>

      {/* Subscription Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Subscription Details
            </DialogTitle>
          </DialogHeader>
          {detailSub &&
            (() => {
              const expired = isSubscriptionExpired(detailSub.endDate);
              const daysLeft = getDaysUntilExpiry(detailSub.endDate);
              return (
                <div className="space-y-4 py-2">
                  {/* Plan Overview */}
                  <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                    <h3 className="font-black text-slate-900 text-base">
                      {detailSub.planName}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Status
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                            expired
                              ? "bg-red-100 text-red-700"
                              : detailSub.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {expired ? "EXPIRED" : detailSub.status || "UNKNOWN"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Expiry
                        </p>
                        <p className="mt-1 font-semibold text-slate-800 text-sm">
                          {detailSub.endDate
                            ? expired
                              ? `Expired on ${new Date(detailSub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                              : daysLeft !== null && daysLeft <= 7
                                ? `Expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`
                                : `Valid till ${new Date(detailSub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Start Date
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {detailSub.startDate
                            ? new Date(detailSub.startDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          End Date
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {detailSub.endDate
                            ? new Date(detailSub.endDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Session Usage */}
                  {detailSub.availableSessions && (
                    <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                      <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                        Session Usage
                      </h4>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-bold text-slate-500 uppercase">
                            Total
                          </p>
                          <p className="mt-1 text-xl font-black text-slate-900">
                            {detailSub.availableSessions.total}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-bold text-slate-500 uppercase">
                            Used
                          </p>
                          <p className="mt-1 text-xl font-black text-slate-900">
                            {detailSub.availableSessions.used}
                          </p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3">
                          <p className="text-xs font-bold text-primary uppercase">
                            Left
                          </p>
                          <p className="mt-1 text-xl font-black text-primary">
                            {detailSub.availableSessions.remaining}
                          </p>
                        </div>
                      </div>
                      {typeof detailSub.availableSessions.percentageUsed ===
                        "number" && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Usage</span>
                            <span>
                              {Math.round(
                                detailSub.availableSessions.percentageUsed,
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(detailSub.availableSessions.percentageUsed, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                      Payment Info
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Amount Paid
                        </p>
                        <p className="mt-1 font-black text-slate-900 text-base">
                          {currencySymbol}
                          {(
                            detailSub.finalAmount ??
                            detailSub.amount ??
                            0
                          ).toLocaleString()}
                        </p>
                        {detailSub.discountAmount > 0 && (
                          <p className="text-xs text-slate-400 line-through">
                            {currencySymbol}
                            {detailSub.amount?.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {detailSub.discountAmount > 0 && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Discount
                          </p>
                          <p className="mt-1 font-semibold text-green-600">
                            –{currencySymbol}
                            {detailSub.discountAmount?.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {detailSub.couponCode && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Coupon Used
                          </p>
                          <p className="mt-1 font-semibold text-green-600">
                            {detailSub.couponCode}
                          </p>
                        </div>
                      )}
                      {detailSub.paymentGateway && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Gateway
                          </p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {detailSub.paymentGateway}
                          </p>
                        </div>
                      )}
                      {detailSub.orderId && (
                        <div className="col-span-2">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Order ID
                          </p>
                          <p className="mt-1 font-mono text-xs text-slate-700 break-all">
                            {detailSub.orderId}
                          </p>
                        </div>
                      )}
                      {detailSub.paymentId && (
                        <div className="col-span-2">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Payment ID
                          </p>
                          <p className="mt-1 font-mono text-xs text-slate-700 break-all">
                            {detailSub.paymentId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Auto Renew / Next Billing */}
                  {(detailSub.autoRenew !== undefined ||
                    detailSub.nextBillingDate) && (
                    <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                      <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                        Renewal Info
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {/* {detailSub.autoRenew !== undefined && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Auto Renew</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-black ${detailSub.autoRenew ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                            {detailSub.autoRenew ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      )} */}
                        {detailSub.nextBillingDate && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                              Next Billing
                            </p>
                            <p className="mt-1 font-semibold text-slate-800">
                              {new Date(
                                detailSub.nextBillingDate,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Purchased Services */}
                  {/* {detailSub.purchasedServices && detailSub.purchasedServices.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Included Services</h4>
                    <div className="space-y-2">
                      {detailSub.purchasedServices.map((svc, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 rounded px-3 py-2">
                          <span className="font-semibold text-slate-800">{svc.serviceName || svc.serviceId?.name || "Service"}</span>
                          {svc.serviceSessionInfo && (
                            <span className="text-xs text-slate-500">
                              {svc.serviceSessionInfo.used}/{svc.serviceSessionInfo.total} used
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    {detailSub.createdAt && (
                      <span>
                        Purchased on{" "}
                        {new Date(detailSub.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </span>
                    )}
                    {/* <span>ID: {detailSub._id}</span> */}
                  </div>
                </div>
              );
            })()}
          <div className="flex justify-between items-center pt-2">
            <Button
              className="font-bold bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => detailSub && handleDownloadInvoice(detailSub)}
              disabled={!!detailSub && downloadingId === detailSub._id}
            >
              {detailSub && downloadingId === detailSub._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {detailSub && downloadingId === detailSub._id
                ? "Generating PDF..."
                : "Download Invoice"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}