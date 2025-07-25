const UploadComponent = ({ setFiles }) => {
  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <svg
            className="text-primary mb-4 size-12"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-base text-gray-500">
            <span className="font-semibold text-primary-100">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-sm text-gray-500">CSV (MAX. 10MB)</p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          accept=".csv"
          onChange={(e) => setFiles(Array.from(e.target.files))}
          multiple={false} // Disable multiple files
          required
        />
      </label>
    </div>
  );
};
export default UploadComponent;
