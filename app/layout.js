import "./globals.css";

export const metadata = {
  title: "Первый круг — картинг-школа",
  description: "Приложение детской картинг-школы «Первый круг»",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
