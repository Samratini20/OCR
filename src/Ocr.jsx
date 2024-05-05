import { useEffect, useState} from 'react';
import Tesseract from 'tesseract.js';
import './App.css';
import { CSVLink } from 'react-csv';

function Ocr() {
  const [imagePath, setImagePath] = useState("");
  const [text,setText] = useState("");
  const [header,setHeaders] = useState("");
 
  useEffect(()=>{
      document.getElementById('text-box').style.display = 'none';
  },[])
  const handleChange = (event) => {
    document.getElementById('text-box').style.display = 'none';
    setText('');
    if(event.target.files[0]) setImagePath(URL.createObjectURL(event.target.files[0]));
  }
 
  const handleClick = () => {
    document.getElementById('text-box').style.display = 'flex';
    Tesseract.recognize(
      imagePath,'eng',
      { 
        logger: m => console.log(m) 
      }
    )
    .catch (err => {
      console.error(err);
    })
    .then(result => {
      let data = (result && result.data && result.data.text) ? result.data.text : 'Sorry ! extraction failed';
      const entries = data.split('\n');
    const keyValuePairs = [];
    const headers = [];

    for (let entry of entries) {
        const lines = entry.split('\n');
        const entryKeyValuePairs = {};
        for (let line of lines) {
            const [key, value] = line.split(':').map(str => str.trim());
            if (key && value) {
              headers.push({'label':key,'key':key});
              entryKeyValuePairs[key] = value;
            }else if(!key || (!key && !value)){
              continue;
            }else if(!value){
              headers.push({'label':'No Key','key':'NoKey'});
              entryKeyValuePairs['NoKey'] = key;
            }
        }
        if (Object.keys(entryKeyValuePairs).length > 0) {
            keyValuePairs.push(entryKeyValuePairs);
        }
    }
    
      setText(keyValuePairs);
      setHeaders(headers);
  })
  }
 
  return (
         <div className="app align-items-center container-fluid d-flex flex-column">
          <div className='d-flex pt-5 w-50 h-50'>
        { imagePath ?
           <img 
           src={imagePath} alt="Sorry Not Loaded" className="h-100 w-100 img-fluid rounded m-auto py-3 d-block"/>
           :
           ''
        }
        </div>
        <div id="text-box">
            {text ? <div className='animate-bounce h-6 my-2 text-decoration-underline fw-bold text-uppercase fs-3'> 
              <CSVLink data={text} headers={header} filename={'extractedText.csv'}>
                  Download CSV
              </CSVLink></div> :
              <div className="d-flex justify-content-center my-2 py-2 align-items-center">
              <div className="spinner-border mx-2" role="status">
              </div>
              <span>Loading...</span>
            </div>
            } 
        </div>
        <div className="py-2">
           {!imagePath ? <label for="File" className="form-label fs-2">Please select an image to extract the text</label> : ''}
            <input className="form-control" type="file" onChange={handleChange} />
        </div>
        <button onClick={handleClick} id="convertBtn" className="btn btn-lg btn-outline-light mb-3 mt-2"
        > convert to text</button>
        </div>
  );
}
 
export default Ocr
