import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Overview from "@/sections/Overview";
import Requirements from "@/sections/Requirements";
import Traceability from "@/sections/Traceability";
import UserJourney from "@/sections/UserJourney";
import BusinessArchitecture from "@/sections/BusinessArchitecture";
import TechnicalArchitecture from "@/sections/TechnicalArchitecture";
import BackendModules from "@/sections/BackendModules";
import DataModel from "@/sections/DataModel";
import TechStack from "@/sections/TechStack";
import TicketLifecycle from "@/sections/TicketLifecycle";
import PaymentFlow from "@/sections/PaymentFlow";
import TicketSecurity from "@/sections/TicketSecurity";
import Scanner from "@/sections/Scanner";
import StadiumModel from "@/sections/StadiumModel";
import SecurityArchitecture from "@/sections/SecurityArchitecture";
import FraudAbuse from "@/sections/FraudAbuse";
import FinancialReconciliation from "@/sections/FinancialReconciliation";
import MatchDay from "@/sections/MatchDay";
import Roadmap from "@/sections/Roadmap";
import IndustryPatterns from "@/sections/IndustryPatterns";
import Decisions from "@/sections/Decisions";
import NotFound from "@/sections/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="requirements" element={<Requirements />} />
        <Route path="traceability" element={<Traceability />} />
        <Route path="journey" element={<UserJourney />} />
        <Route path="business" element={<BusinessArchitecture />} />
        <Route path="architecture" element={<TechnicalArchitecture />} />
        <Route path="backend" element={<BackendModules />} />
        <Route path="data-model" element={<DataModel />} />
        <Route path="stack" element={<TechStack />} />
        <Route path="lifecycle" element={<TicketLifecycle />} />
        <Route path="payments" element={<PaymentFlow />} />
        <Route path="ticket-security" element={<TicketSecurity />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="stadium" element={<StadiumModel />} />
        <Route path="security" element={<SecurityArchitecture />} />
        <Route path="fraud" element={<FraudAbuse />} />
        <Route path="finance" element={<FinancialReconciliation />} />
        <Route path="match-day" element={<MatchDay />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="industry" element={<IndustryPatterns />} />
        <Route path="decisions" element={<Decisions />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
