import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { DiagnosisProvider } from "./contexts/DiagnosisContext";
import { ForumCartProvider } from "./contexts/ForumCartContext";
import { PricingProvider } from "./contexts/PricingContext";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { CustomerShell } from "./layouts/CustomerShell";
import { DeliveryLayout } from "./layouts/DeliveryLayout";
import { ForumLayout } from "./layouts/ForumLayout";
import { OpsLayout } from "./layouts/OpsLayout";
import { RestaurantLayout } from "./layouts/RestaurantLayout";
import { SupportLayout } from "./layouts/SupportLayout";
import { CartPage } from "./pages/customer/CartPage";
import { CheckoutPage } from "./pages/customer/CheckoutPage";
import { CheckoutSuccessPage } from "./pages/customer/CheckoutSuccessPage";
import { ConsentPage } from "./pages/customer/ConsentPage";
import { HomePage } from "./pages/customer/HomePage";
import { LoginPage } from "./pages/customer/LoginPage";
import { MenuPage } from "./pages/customer/MenuPage";
import { OrderTrackPage } from "./pages/customer/OrderTrackPage";
import { RecoveryPage } from "./pages/customer/RecoveryPage";
import { DeliveryDetailPage } from "./pages/delivery/DeliveryDetailPage";
import { DeliveryListPage } from "./pages/delivery/DeliveryListPage";
import { DiagnosisStep1Page } from "./pages/forum/diagnosis/DiagnosisStep1Page";
import { DiagnosisStep2Page } from "./pages/forum/diagnosis/DiagnosisStep2Page";
import { DiagnosisStep3Page } from "./pages/forum/diagnosis/DiagnosisStep3Page";
import { DiagnosisStep4Page } from "./pages/forum/diagnosis/DiagnosisStep4Page";
import { ForumCheckoutPage } from "./pages/forum/ForumCheckoutPage";
import { ForumCheckoutSuccessPage } from "./pages/forum/ForumCheckoutSuccessPage";
import { ForumRazorpayCheckoutPage } from "./pages/forum/ForumRazorpayCheckoutPage";
import { ForumRazorpayStubPage } from "./pages/forum/ForumRazorpayStubPage";
import { ForumHomePage } from "./pages/forum/ForumHomePage";
import { CatalogListingPage } from "./pages/forum/catalog/CatalogListingPage";
import { ForumCartPage } from "./pages/forum/ForumCartPage";
import { OfferPage } from "./pages/forum/OfferPage";
import { DecisionsPage } from "./pages/ops/DecisionsPage";
import { OpsHome } from "./pages/ops/OpsHome";
import { OpsOrderPage } from "./pages/ops/OpsOrderPage";
import { PoliciesPage } from "./pages/ops/PoliciesPage";
import { InventoryPage } from "./pages/restaurant/InventoryPage";
import { OrderDetailPage } from "./pages/restaurant/OrderDetailPage";
import { OrdersQueuePage } from "./pages/restaurant/OrdersQueuePage";
import { RestaurantHome } from "./pages/restaurant/RestaurantHome";
import { IncidentDetailPage } from "./pages/support/IncidentDetailPage";
import { SupportInbox } from "./pages/support/SupportInbox";

function App() {
  return (
    <AuthProvider>
      <DiagnosisProvider>
        <CartProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <CustomerShell>
                  <LoginPage />
                </CustomerShell>
              }
            />

            <Route
              element={
                <CustomerShell>
                  <PricingProvider>
                    <ForumCartProvider>
                      <ForumLayout />
                    </ForumCartProvider>
                  </PricingProvider>
                </CustomerShell>
              }
            >
              <Route index element={<ForumHomePage />} />
              <Route path="trainings" element={<CatalogListingPage categoryPath="trainings" />} />
              <Route path="certifications" element={<CatalogListingPage categoryPath="certifications" />} />
              <Route path="services" element={<CatalogListingPage categoryPath="services" />} />
              <Route path="cart" element={<ForumCartPage />} />
              <Route path="diagnosis/step-1" element={<DiagnosisStep1Page />} />
              <Route path="diagnosis/step-2" element={<DiagnosisStep2Page />} />
              <Route path="diagnosis/step-3" element={<DiagnosisStep3Page />} />
              <Route path="diagnosis/step-4" element={<DiagnosisStep4Page />} />
              <Route path="offers/:code" element={<OfferPage />} />
              <Route path="checkout" element={<ForumCheckoutPage />} />
              <Route path="checkout/razorpay" element={<ForumRazorpayCheckoutPage />} />
              <Route path="checkout/razorpay/stub" element={<ForumRazorpayStubPage />} />
              <Route path="checkout/success" element={<ForumCheckoutSuccessPage />} />
            </Route>

            <Route
              path="/demo"
              element={
                <CustomerShell>
                  <CustomerLayout />
                </CustomerShell>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="recovery" element={<RecoveryPage />} />
              <Route path="orders/:orderId" element={<OrderTrackPage />} />
              <Route path="consent" element={<ConsentPage />} />
            </Route>

            <Route path="/restaurant" element={<RestaurantLayout />}>
              <Route index element={<RestaurantHome />} />
              <Route path="orders" element={<OrdersQueuePage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="inventory" element={<InventoryPage />} />
            </Route>

            <Route path="/ops" element={<OpsLayout />}>
              <Route index element={<OpsHome />} />
              <Route path="policies" element={<PoliciesPage />} />
              <Route path="decisions" element={<DecisionsPage />} />
              <Route path="orders/:id" element={<OpsOrderPage />} />
            </Route>

            <Route path="/support" element={<SupportLayout />}>
              <Route index element={<SupportInbox />} />
              <Route path="incidents/:id" element={<IncidentDetailPage />} />
            </Route>

            <Route path="/delivery" element={<DeliveryLayout />}>
              <Route index element={<DeliveryListPage />} />
              <Route path=":id" element={<DeliveryDetailPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </DiagnosisProvider>
    </AuthProvider>
  );
}

export default App;
