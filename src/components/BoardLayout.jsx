import Header from './Header';
import Footer from './Footer';

export default function BoardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* main에 w-full, flex-1, overflow-auto 옵션 추천 */}
      <main className="flex-1 w-full flex flex-col items-center justify-center bg-gray-50 px-2 py-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
