import { useState } from "react";
import { Layout } from "../../components/Layout";
import { elviraMenuItems } from "../../utils/elvira/menuItems";
import { ElviraDashboard } from "./ElviraDashboard";
import { Overview } from "./overview";
import { HotelsManagement } from "./hotels/HotelsManagement";
import { EmployeesManagement } from "./employees/EmployeesManagement";
import type { UserProfile } from "../../types/auth";

interface ElviraAppProps {
  user: UserProfile;
  onSignOut: () => void;
}

export function ElviraApp({ user, onSignOut }: ElviraAppProps) {
  const [activeMenuItem, setActiveMenuItem] = useState("overview");

  console.log("🎯 ElviraApp - Active menu item:", activeMenuItem);
  console.error("🎯 ElviraApp - Active menu item:", activeMenuItem); // Also log as error so it stands out

  const handleMenuChange = (menuId: string) => {
    console.log("🔄 Menu changed to:", menuId);
    console.error("🔄 Menu changed to:", menuId);
    setActiveMenuItem(menuId);
  };

  const renderContent = () => {
    console.log("📄 Rendering content for:", activeMenuItem);
    console.error("📄 Rendering content for:", activeMenuItem);

    switch (activeMenuItem) {
      case "overview":
        console.log("✅ Returning Overview component");
        return <Overview />;
      case "dashboard":
        console.log("✅ Returning ElviraDashboard component");
        return <ElviraDashboard />;
      case "hotels":
        console.log("✅ Returning HotelsManagement component");
        console.error("✅ HOTELS: Returning HotelsManagement component");
        return <HotelsManagement />;
      case "employees":
        console.log("✅ Returning EmployeesManagement component");
        console.error("✅ EMPLOYEES: Returning EmployeesManagement component");
        return <EmployeesManagement />;
      default:
        console.log("⚠️ Returning default Overview component");
        return <Overview />;
    }
  };

  return (
    <Layout
      user={user}
      onSignOut={onSignOut}
      menuItems={elviraMenuItems}
      activeMenuItem={activeMenuItem}
      onMenuItemChange={handleMenuChange}
      collapsible={true}
    >
      {renderContent()}
    </Layout>
  );
}
