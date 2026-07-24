import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgetPassword";
// import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admins from "./pages/Admins";
import BecomePartner from "./pages/BecomePartner";

import Partners from "./pages/Partners";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/companyDetails";
import Branches from "./pages/branches/Branches";
import BranchDetail from "./pages/branches/BranchDetails";
import BiddingList from "./pages/bidding/BiddingList";
import AdminSupplierPerformance from "./pages/bidding/AdminSupplierPerformance";
import BiddingDetail from "./pages/bidding/BiddingDetail";
import BranchCatalog from "./pages/branches/BranchCatalog";
import AdminOrders from "./pages/Order/AdminOrders";

import AdminPaymentDashboard from "./pages/paymentRecords/AdminPaymentDashboard";
import RevenueRecords from "./pages/paymentRecords/Buyer/RevenueRecords";
import ReceiptsApprovalList from "./pages/paymentRecords/Buyer/ReceiptsApprovalList";

import ReceiptDetail from "./pages/paymentRecords/Buyer/ReceiptDetail";
import AdminCommission from "./pages/paymentRecords/AdminCommission";
import ExpenseRecords from "./pages/paymentRecords/Supplier/ExpenseRecords";
import ExpenseDetail from "./pages/paymentRecords/Supplier/ExpenseDetail";
import BuyerSummary from "./pages/paymentRecords/Buyer/BuyerSummary";
import BuyerInvoices from "./pages/paymentRecords/Buyer/BuyerInvoices";
import BuyerDeliveryTracking from "./pages/paymentRecords/Buyer/BuyerDeliveryTracking";
import BuyerProfile from "./pages/profiles/BuyerProfile";
import SupplierProfile from "./pages/profiles/SupplierProfile";
import { AdminReturnDetail, AdminReturnOrders } from "./pages/Order/AdminReturnOrders";
import SupplierPaymentDays from "./pages/paymentRecords/Supplier/paymentOutstanding/SupplierPaymentDays";
import SupplierPaymentDetail from "./pages/paymentRecords/Supplier/paymentOutstanding/SupplierPaymentDetail";





import RiderEarningsDetail from "./pages/paymentRecords/Rider/RiderEarningsDetail";
import RiderEarningsDebts from "./pages/paymentRecords/Rider/RiderEarningsDebts";
import RiderEarningsMonths from "./pages/paymentRecords/Rider/RiderEarningsMonths";
import Countries from "./pages/Settings/masterData/Countries";
import Categories from "./pages/Settings/masterData/Categories";
import Items from "./pages/Settings/masterData/Items";
import Brands from "./pages/Settings/masterData/Brands";
import BiddingSettings from "./pages/Settings/CommissionSetting/BiddingSettings";
import CommissionSettings from "./pages/Settings/CommissionSetting/CommissionSettings";
import DeliverySettings from "./pages/Settings/CommissionSetting/DeliverySettings";
import Dashboard from "./pages/Dashboard";
import Banners from "./pages/AppConfig/Banners";
import Faqs from "./pages/AppConfig/Faqs";
import Terms from "./pages/AppConfig/Terms";




const WithLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard"                                   element={<WithLayout><Dashboard /></WithLayout>} />
        <Route path="/profile"                                     element={<WithLayout><Profile /></WithLayout>} />
        <Route path="/becomePartner"                               element={<WithLayout><BecomePartner /></WithLayout>} />
        <Route path="/partners"                                    element={<WithLayout><Partners /></WithLayout>} />
        <Route path="/companies"                                   element={<WithLayout><Companies /></WithLayout>} />
        <Route path="/companies/:id"                               element={<WithLayout><CompanyDetail /></WithLayout>} />
        <Route path="/branches"                                    element={<WithLayout><Branches /></WithLayout>} />
        <Route path="//branches/:id/detail"                        element={<WithLayout><BranchDetail /></WithLayout>} />
        <Route path="/branches/:id/catalog"                        element={<WithLayout><BranchCatalog /></WithLayout>} />
        <Route path="/biddingList"                                 element={<WithLayout><BiddingList /></WithLayout>} />
        <Route path="/bidding/:id"                                 element={<WithLayout><BiddingDetail/></WithLayout>} />
        <Route path="/bidding/suppliers"                           element={<WithLayout><AdminSupplierPerformance /></WithLayout>} />
        <Route path="/AdminOrders"                                 element={<WithLayout><AdminOrders /></WithLayout>} />
       
        <Route path="/payments"                                    element={<WithLayout><AdminPaymentDashboard /></WithLayout>} />
        <Route path="/payments/commission"                         element={<WithLayout><AdminCommission /></WithLayout>} />
        <Route path="/payments/ReceiptsApprovalList"               element={<WithLayout><ReceiptsApprovalList /></WithLayout>} />
        <Route path="/payments/revenue"                            element={<WithLayout><RevenueRecords /></WithLayout>} />
        <Route path="/payments/receipts/:receiptId"                element={<WithLayout><ReceiptDetail /></WithLayout>} />
        <Route path="/payments/buyers"                             element={<WithLayout><BuyerSummary /></WithLayout>} />
        <Route path="/payments/buyers/:branchId"                   element={<WithLayout><BuyerInvoices /></WithLayout>} />
        {/* <Route path="/payments/buyers/:branchId"                  element={<WithLayout><BuyerInvoices /></WithLayout>} /> */}

        <Route path="/payments/expense"                            element={<WithLayout><ExpenseRecords /></WithLayout>} />
        <Route path="/payments/expense/:date/:supplierKey"        element={<WithLayout><ExpenseDetail/></WithLayout>} />
        <Route path="/payments/Supplier/Outstanding"              element={<WithLayout><SupplierPaymentDays /></WithLayout>} />
        <Route path="/payments/Supplier/Outstanding/:date"        element={<WithLayout><SupplierPaymentDetail /></WithLayout>} />
        <Route path="/payments/rider-earnings"                    element={<WithLayout><RiderEarningsMonths /></WithLayout>} />
        <Route path="/payments/rider-earnings/debts"              element={<WithLayout><RiderEarningsDebts /></WithLayout>} />
        <Route path="/payments/rider-earnings/:month/:companyId"  element={<WithLayout><RiderEarningsDetail /></WithLayout>} />       
        <Route path="/payments/buyers/delivery-tracking"          element={<WithLayout><BuyerDeliveryTracking /></WithLayout>} />
        <Route path="/buyers/:branchId/profile"                   element={<WithLayout><BuyerProfile /></WithLayout>} />
        <Route path="/suppliers/:branchId/profile"                element={<WithLayout><SupplierProfile /></WithLayout>} />


        <Route path="/countries"                                  element={<WithLayout><Countries /></WithLayout>} />
        <Route path="/categories"                                 element={<WithLayout><Categories /></WithLayout>} />
        <Route path="/items"                                      element={<WithLayout><Items /></WithLayout>} />
        <Route path="/brands"                                     element={<WithLayout><Brands /></WithLayout>} />
        <Route path="/biddingSettings"                            element={<WithLayout><BiddingSettings /></WithLayout>} />
        <Route path="/commissionSettings"                         element={<WithLayout><CommissionSettings /></WithLayout>} />
        <Route path="/deliverySettings"                           element={<WithLayout><DeliverySettings /></WithLayout>} />
        <Route path="/banners"                                     element={<WithLayout><Banners /></WithLayout>} />
        <Route path="/faqs"                                       element={<WithLayout><Faqs /></WithLayout>} />
        <Route path="/terms"                                      element={<WithLayout><Terms /></WithLayout>} />

        <Route path="/admins"                                     element={<WithLayout><Admins/></WithLayout>} />
        <Route path="/return-orders"                              element={<WithLayout><AdminReturnOrders /></WithLayout>} />
        <Route path="/returns/:returnId"                          element={<WithLayout><AdminReturnDetail /></WithLayout>} />
        {/* <Route path="/returns/rider-debts"                        element={<WithLayout><AdminRiderDebts /></WithLayout>} /> */}



        
   
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
