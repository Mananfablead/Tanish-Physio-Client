import React from "react";

interface InvoiceProps {
  bookingData: any;
  bookingDetails: any;
  guestUser: any;
  user: any;
  primaryDoctor: any;
  serviceName: string;
  serviceDuration: string;
  servicePrice: string | number;
  sessionDate: string;
  sessionTime: string;
  therapist: any;
  isFreeConsultation: boolean;
  isSubscription: boolean;
}

const InvoiceComponent: React.FC<InvoiceProps> = ({
  bookingData,
  bookingDetails,
  guestUser,
  user,
  primaryDoctor,
  serviceName,
  serviceDuration,
  servicePrice,
  sessionDate,
  sessionTime,
  therapist,
  isFreeConsultation,
  isSubscription,
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="invoice-container bg-white p-8 m-4 print:p-4 print:m-0">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            box-shadow: none;
            margin: 0;
            padding: 16px;
          }
        }
      `}</style>
      
      <div className="invoice-header border-b pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <img 
              src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png" 
              alt="Tanish Physio Logo"
              className="w-16 h-16 mr-4"
              onError={(e) => {
                // Fallback if logo fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* <div>
              <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-gray-600 mt-2">Invoice #: {bookingData?.bookingId || "N/A"}</p>
            </div> */}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Tanish Physio</h2>
            <p className="text-gray-600">Physical Therapy & Rehabilitation</p>
            <p className="text-gray-600">India</p>
          </div>
        </div>
      </div>

      <div className="invoice-details grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">
            {user?.name || guestUser?.name || "Guest User"}
          </p>
          <p className="text-gray-600">{user?.email || guestUser?.email || "N/A"}</p>
          <p className="text-gray-600">{user?.phone || guestUser?.phone || "N/A"}</p>
        </div>

        <div className="text-right">
          <div className="mb-4">
            <p className="text-gray-600">Invoice Date:</p>
            <p className="font-medium">{currentDate}</p>
          </div>
          <div>
            <p className="text-gray-600">Due Date:</p>
            <p className="font-medium">{currentDate}</p>
          </div>
        </div>
      </div>

      <div className="invoice-items mb-8">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-left p-3 font-semibold">Date & Time</th>
                <th className="text-left p-3 font-semibold">Therapist</th>
                <th className="text-right p-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-t">
                  <div className="font-medium">{serviceName}</div>
                  <div className="text-gray-600 text-sm">
                    {isSubscription ? "Subscription Plan" : "Service Booking"}
                  </div>
                </td>
                <td className="p-3 border-t">
                  <div>{sessionDate}</div>
                  <div>{sessionTime}</div>
                </td>
                <td className="p-3 border-t">
                  <div>{therapist.name}</div>
                  <div className="text-gray-600 text-sm">{therapist.title}</div>
                </td>
                <td className="p-3 border-t text-right">
                  ₹{servicePrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="invoice-summary grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
          <p className="text-gray-600">
            {bookingDetails?.paymentMethod || bookingData?.paymentMethod || "Online Payment"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span>₹{servicePrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Tax:</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Discount:</span>
            <span>
              ₹{(bookingDetails?.discountAmount || 0)?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>
              ₹{servicePrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
        </div>
      </div>

      <div className="invoice-footer mt-8 pt-6 border-t">
        <div className="text-center text-gray-600">
          <p>Thank you for choosing Tanish Physio for your healthcare needs.</p>
          <p className="mt-2">For any inquiries, please contact our support team.</p>
        </div>
      </div>
      
      {/* Print Controls - Hidden during PDF generation */}
      <div className="print-controls mt-6 text-center print:hidden">
        <button 
          onClick={(e) => {
            e.preventDefault();
            window.print();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
        >
          Print Invoice
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Use Ctrl+P to print or save as PDF
        </p>
      </div>
    </div>
  );
};

export default InvoiceComponent;