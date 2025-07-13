import NavBar from "../../components/NavBar";

const Layout = ({ children }) => {
  return (
    <>
      <NavBar />
      <div className="mt-10 p-4 lg:ml-64">{children}</div>
    </>
  );
};

export default Layout;
