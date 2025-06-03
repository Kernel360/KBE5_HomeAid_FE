import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MobileMainLayout({ children, username }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-14">
      <Header username={username} />
      <main className="flex-1 px-3">{children}</main>
      <Footer />
    </div>
  );
}
