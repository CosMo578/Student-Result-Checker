import NavBar from "@/components/NavBar";

const Layout = ({ children }) => {
  return (
    <>
      <NavBar />
      <div className="mt-10 px-6 py-4 lg:ml-64">{children}</div>
    </>
  );
};

export default Layout;
