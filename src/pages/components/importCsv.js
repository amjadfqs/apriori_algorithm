import Papa from 'papaparse';

function ImportCvs({ setResult }) {

  function handleFileUpload(event) {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true, // remove the empty row
      trim: true,
      complete: (results) => {
        const cleanedData = results.data.map(row => {
          return row.filter(item => item.trim() !== '');
        });
        setResult(cleanedData);
      },
    });
  }

  return (
    <>
      <h1 className='my-4 text-2xl font-extrabold leading-none tracking-tight'>Import an Csv File</h1>
      <div>
        <input type="file" accept='.csv' onChange={handleFileUpload} className="file-input file-input-bordered file-input-success w-full max-w-xs" />
      </div>
    </>
  );
}

export default ImportCvs;
