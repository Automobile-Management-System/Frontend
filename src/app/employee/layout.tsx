import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeSidebar } from "../../../components/employee/employeesidebar"



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <EmployeeSidebar/>
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}