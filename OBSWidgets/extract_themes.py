with open('temp_account.tsx', 'r') as f:
    acc_content = f.read()

start = acc_content.find("export interface ThemeOption")
end = acc_content.find("function AccountContent()")

theme_code = acc_content[start:end]

with open('src/app/(app)/dashboard/page.tsx', 'r') as f:
    dash_content = f.read()

dash_content = dash_content.replace("function DashboardContent() {", theme_code + "\nfunction DashboardContent() {")

with open('src/app/(app)/dashboard/page.tsx', 'w') as f:
    f.write(dash_content)

