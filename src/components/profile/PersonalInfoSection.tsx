import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Mail, Phone, MapPin, Calendar, IndianRupee, Clock, HeartPulse, Stethoscope } from "lucide-react";

interface PersonalInfoSectionProps {
  user: any;
  onSaveChanges: () => void;
}

export function PersonalInfoSection({ user, onSaveChanges }: PersonalInfoSectionProps) {
  console.log("user--------->>>", user)
  return (
    <div className="space-y-8">
      <Tabs defaultValue="personal" className="w-full">
       <TabsList className="
  grid w-full 
  grid-cols-2 sm:grid-cols-4 
  gap-2
  h-auto sm:h-14 
  p-2
  bg-slate-200/50 backdrop-blur-md 
  rounded-2xl mb-8 
  border border-slate-200 shadow-sm
">

  <TabsTrigger
    value="personal"
    className="h-11 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 
    data-[state=active]:bg-white 
    data-[state=active]:text-primary 
    data-[state=active]:shadow-md"
  >
    Personal Info
  </TabsTrigger>

  <TabsTrigger
    value="subscription"
    className="h-11 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 
    data-[state=active]:bg-white 
    data-[state=active]:text-primary 
    data-[state=active]:shadow-md"
  >
    Subscription
  </TabsTrigger>

  <TabsTrigger
    value="health"
    className="h-11 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 
    data-[state=active]:bg-white 
    data-[state=active]:text-primary 
    data-[state=active]:shadow-md"
  >
    Health Profile
  </TabsTrigger>

  <TabsTrigger
    value="services"
    className="h-11 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 
    data-[state=active]:bg-white 
    data-[state=active]:text-primary 
    data-[state=active]:shadow-md"
  >
    Services
  </TabsTrigger>

</TabsList>



        <TabsContent value="personal">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="name"
                      defaultValue={user?.name ?? "User"}
                      className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      defaultValue={user?.email}
                      disabled
                      className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="phone"
                      defaultValue={user?.phone ?? ""}
                      className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="location"
                      defaultValue={user?.location ?? ""}

                      placeholder="Enter your location"
                      className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
              <Button
                className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black transition-all"
                onClick={onSaveChanges}
              >
                <Save className="h-5 w-5 mr-2" /> Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
         <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px]">
  <div className="space-y-6">
    
    {/* Heading */}
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
        Subscription Overview
      </h3>
    </div>

    {user?.subscriptionData ? (
      <div className="space-y-6">

        {/* Subscription Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Plan Name */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Plan Name
            </Label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <div className="h-12 pl-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center font-bold text-slate-700">
                {user.subscriptionData?.planName || "N/A"}
              </div>
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Billing Cycle
            </Label>
            <div className="relative">
              <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <div className="h-12 pl-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center font-bold text-slate-700">
                {user.subscriptionData?.planId
                  ? String(user.subscriptionData.planId).charAt(0).toUpperCase() +
                    String(user.subscriptionData.planId).slice(1)
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* Subscription Amount */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Subscription Amount
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <div className="h-12 pl-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center font-bold text-slate-700">
                {user.subscriptionData?.currency || "INR"}{" "}
                {user.subscriptionData?.amount ?? 0}
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Subscription Status
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.subscriptionData?.status === "active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <div className="h-12 pl-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center font-bold text-slate-700">
                {user.subscriptionData?.status
                  ? String(user.subscriptionData.status).charAt(0).toUpperCase() +
                    String(user.subscriptionData.status).slice(1)
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* Activation Date */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Activation Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <div className="h-12 pl-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center font-bold text-slate-700">
                {user.subscriptionData?.startDate
                  ? new Date(
                      user.subscriptionData.startDate
                    ).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Expiry Date
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <div className="h-12 pl-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center font-bold text-slate-700">
                {user.subscriptionData?.endDate
                  ? new Date(
                      user.subscriptionData.endDate
                    ).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </div>

        </div>

        {/* Remaining Validity Section */}
        <div className="pt-4">
          <div
            className={`rounded-xl p-5 ${
              user.subscriptionData?.isExpired
                ? "bg-red-50"
                : "bg-primary/10"
            }`}
          >
            <h4
              className={`font-bold text-lg mb-2 ${
                user.subscriptionData?.isExpired
                  ? "text-red-600"
                  : "text-primary"
              }`}
            >
              {user.subscriptionData?.isExpired
                ? "Subscription Expired"
                : "Remaining Validity"}
            </h4>

            {!user.subscriptionData?.isExpired ? (
              <>
                <p className="text-3xl font-bold text-slate-900">
                  {user.subscriptionData?.daysRemaining ?? 0} Days Left
                </p>
                <p className="text-slate-600 mt-1">
                  Your subscription is active and valid until the expiry date.
                </p>
              </>
            ) : (
              <p className="text-slate-600">
                Your subscription has expired. Please renew to continue
                accessing premium features.
              </p>
            )}
          </div>
        </div>

      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Stethoscope className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">
          No Active Subscription
        </h3>
        <p className="text-slate-500">
          You currently do not have an active subscription. Upgrade to unlock
          premium features and personalized care.
        </p>
      </div>
    )}

  </div>
</Card>

        </TabsContent>

        {/* Health Profile Tab */}
        <TabsContent value="health">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Health Profile
                </h3>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-bold text-slate-700 mb-3">Health Questionnaire</h4>
                  <p className="text-slate-600 mb-4">Your health questionnaire responses help us provide personalized care recommendations.</p>

               <div className="space-y-4">

  <div className="
    flex flex-col sm:flex-row 
    sm:items-center sm:justify-between 
    gap-2 py-3 
    border-b border-slate-200
  ">
    
    <span className="font-medium text-slate-700 text-sm sm:text-base">
      Questionnaire Responses
    </span>

    <span className="
      self-start sm:self-auto
      text-xs sm:text-sm
      bg-primary/10 text-primary 
      px-3 py-1 
      rounded-full 
      whitespace-nowrap
    ">
      {user?.healthProfile?.questionnaireMetadata?.responses?.length || 0} responses
    </span>

  </div>

</div>


                  <div className="mt-5">
                    <h5 className="font-bold text-slate-700 mb-3">Recent Responses</h5>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {(user?.healthProfile?.questionnaireMetadata?.responses || []).slice(0, 3).map((response, index) => (
                        <div key={response._id || index} className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-sm font-semibold text-slate-800">{response.questionText}</p>
                          <p className="text-sm text-slate-600 mt-1">Answer: {response.answer}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(response.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                      {(!user?.healthProfile?.questionnaireMetadata?.responses || user.healthProfile.questionnaireMetadata.responses.length === 0) && (
                        <p className="text-slate-500 text-sm italic">No questionnaire responses recorded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-bold text-slate-700 mb-3">Doctor Profile</h4>

              <div className="space-y-4">


  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-200">
    
    <span className="font-medium text-slate-700 text-sm sm:text-base">
      Certifications
    </span>

    <span className="self-start sm:self-auto text-xs sm:text-sm bg-primary/10 text-primary px-3 py-1 rounded-full whitespace-nowrap">
      {user?.doctorProfile?.certifications?.length || 0} certifications
    </span>

  </div>


  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-200">
    
    <span className="font-medium text-slate-700 text-sm sm:text-base">
      Languages
    </span>

    <span className="self-start sm:self-auto text-xs sm:text-sm bg-primary/10 text-primary px-3 py-1 rounded-full whitespace-nowrap">
      {user?.doctorProfile?.languages?.length || 0} languages
    </span>

  </div>

</div>

                </div> */}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Services Tab */}
      <TabsContent value="services">
  <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px]">
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          Purchased Services
        </h3>
      </div>

      {user?.purchasedServices?.length > 0 ? (
        <div className="space-y-6">

          {user.purchasedServices.map((service, index) => (

            <div
              key={index}
              className="rounded-xl border border-slate-200 p-5 bg-slate-50 space-y-4"
            >

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">

                <div>
                  <h4 className="text-lg font-bold text-slate-800">
                    {service.name}
                  </h4>

                  <p className="text-slate-600 text-sm mt-1">
                    {service.description}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold text-slate-900">
                    ₹ {service.price}
                  </p>
                  <p className="text-xs text-slate-500">
                    Paid: ₹ {service.amountPaid}
                  </p>
                </div>

              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">

                <div>
                  <span className="font-semibold text-slate-700">Category:</span>
                  <p className="text-slate-600">{service.category}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Duration:</span>
                  <p className="text-slate-600">{service.duration}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Booking Date:</span>
                  <p className="text-slate-600">
                    {service.bookingDate} at {service.bookingTime}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Booking ID:</span>
                  <p className="text-slate-600">{service.bookingId}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Booking Status:</span>
                  <p className={`font-semibold ${
                    service.bookingStatus === "confirmed"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {service.bookingStatus}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Payment Status:</span>
                  <p className={`font-semibold ${
                    service.paymentStatus === "paid"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {service.paymentStatus}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Purchase Date:</span>
                  <p className="text-slate-600">
                    {service.purchaseDate
                      ? new Date(service.purchaseDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Expiry Date:</span>
                  <p className={`font-semibold ${
                    service.isExpired ? "text-red-600" : "text-primary"
                  }`}>
                    {service.expiryDate
                      ? new Date(service.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Validity:</span>
                  <p className="text-slate-600">
                    {service.validity} days
                  </p>
                </div>

              </div>

              {/* Session Info */}
              {service.serviceSessionInfo && (
                <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">

                  <h5 className="font-semibold text-slate-800">
                    Session Details
                  </h5>

                  <div className="flex flex-wrap gap-6 text-sm">

                    <div>
                      <span className="text-slate-500">Total:</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {service.serviceSessionInfo.total}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500">Used:</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {service.serviceSessionInfo.used}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500">Remaining:</span>
                      <span className="ml-2 font-bold text-primary">
                        {service.serviceSessionInfo.remaining}
                      </span>
                    </div>

                  </div>

                </div>
              )}

            </div>

          ))}

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Stethoscope className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            No Purchased Services
          </h3>
          <p className="text-slate-500">
            You haven't purchased any services yet. Explore our offerings to get started.
          </p>
        </div>
      )}

    </div>
  </Card>
</TabsContent>

      </Tabs>
    </div>
  );
}