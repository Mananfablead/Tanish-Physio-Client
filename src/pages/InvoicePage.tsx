import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import InvoiceComponent from "@/components/InvoiceComponent";

const InvoicePage = () => {
  const location = useLocation();
  const { bookingId } = useParams<{ bookingId: string }>();
  
  // Get booking data from location state or props
  const locationState = location.state as any;
  
  // Fallback to state if URL params aren't available
  const finalBookingId = bookingId || locationState?.bookingData?.bookingId;
  
  // Get data from Redux store
  const { admins: publicAdmins } = useSelector((state: RootState) => state.admins);
  const primaryDoctor = publicAdmins?.[0];
  
  // State for booking details
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Extract data from window object or location state
  const invoiceData = (window as any).invoiceData;
  
  const bookingData = invoiceData?.bookingData || locationState?.bookingData || {};
  const guestUser = invoiceData?.guestUser || locationState?.guestUser || {};
  const user = invoiceData?.user || locationState?.user || {};
  const primaryDoctorFromData = invoiceData?.primaryDoctor || primaryDoctor;
  const serviceName = invoiceData?.serviceName || 
    bookingDetails?.serviceName ||
    bookingData?.service?.name ||
    bookingData?.plan?.name ||
    "Physiotherapy";
  
  const isFreeConsultation = invoiceData?.isFreeConsultation || 
                            bookingData?.service?.name?.toLowerCase().includes('free') || 
                            bookingData?.service?.name?.toLowerCase().includes('consultation') ||
                            bookingData?.plan?.name?.toLowerCase().includes('free') ||
                            bookingData?.isFreeConsultation === true;
  
  const serviceDuration = invoiceData?.serviceDuration ||
    bookingDetails?.serviceId?.duration ||
    bookingData?.session?.duration ||
    bookingData?.service?.duration ||
    bookingData?.plan?.duration ||
    (isFreeConsultation ? "30 mins" : "60 mins");
  
  const servicePrice = invoiceData?.servicePrice ||
    bookingData?.finalPrice ||
    bookingData?.service?.price ||
    bookingData?.plan?.price;
  
  const sessionDate = invoiceData?.sessionDate || 
    bookingDetails?.date
      ? new Date(bookingDetails.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : bookingData?.scheduleDate
        ? new Date(bookingData.scheduleDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        : bookingData?.selectedSlot?.date
          ? new Date(bookingData.selectedSlot.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

  const sessionTime = invoiceData?.sessionTime || 
    bookingDetails?.time || 
    bookingData?.scheduleTime || 
    bookingData?.selectedSlot?.time || 
    bookingData?.timeSlot?.start || 
    "Scheduled";
  
  const therapist = invoiceData?.therapist || {
    name: bookingDetails?.therapistName ||
      primaryDoctorFromData?.name ||
      "Physiotherapy Specialist",
    title: bookingDetails?.therapistId?.doctorProfile?.specialization ||
      primaryDoctorFromData?.doctorProfile?.specialization ||
      bookingData?.session?.type ||
      "Senior Physiotherapist",
    avatar: bookingDetails?.therapistId?.profilePicture ||
      primaryDoctorFromData?.profilePicture ||
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    experience: bookingDetails?.therapistId?.doctorProfile?.experience
      ? `${bookingDetails.therapistId.doctorProfile.experience}+ Years`
      : primaryDoctorFromData?.doctorProfile?.experience
        ? `${primaryDoctorFromData.doctorProfile.experience}+ Years`
        : "Experienced",
    qualification: bookingDetails?.therapistId?.doctorProfile?.education ||
      primaryDoctorFromData?.doctorProfile?.education ||
      "MPT (Physiotherapy)",
    languages: (() => {
      try {
        const langs = bookingDetails?.therapistId?.doctorProfile?.languages?.[0] ||
          primaryDoctorFromData?.doctorProfile?.languages?.[0];
        return langs ? JSON.parse(langs).join(", ") : "";
      } catch {
        return "";
      }
    })(),
  };
  
  const isSubscription = invoiceData?.isSubscription || bookingData?.fromSubscription === true;

  useEffect(() => {
    // Try to get data from window object (passed from handleDownload)
    const invoiceData = (window as any).invoiceData;
    
    if (invoiceData) {
      // Use data passed from the parent window
      setBookingDetails(invoiceData.bookingDetails || {});
    } else {
      // Fallback to location state if direct data passing didn't work
      setBookingDetails(locationState?.bookingDetails || {});
    }
    setLoading(false);
    
    // Trigger print automatically after content loads
    const handleAfterPrint = () => {
      // Close the window after printing
      setTimeout(() => {
        window.close();
      }, 1000);
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [locationState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoice...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4 print:px-0">
        <InvoiceComponent
          bookingData={bookingData}
          bookingDetails={bookingDetails}
          guestUser={guestUser}
          user={user}
          primaryDoctor={primaryDoctor}
          serviceName={serviceName}
          serviceDuration={serviceDuration}
          servicePrice={servicePrice}
          sessionDate={sessionDate}
          sessionTime={sessionTime}
          therapist={therapist}
          isFreeConsultation={isFreeConsultation}
          isSubscription={isSubscription}
        />
      </div>
    </div>
  );
};

export default InvoicePage;