import { createContext } from "react";
import { ImageEditor } from "./components/imageEditor";

export const UserContext = createContext(null);

function App() {
  return (
      <div className='px-4 py-4'>
        <div className='flex-auto'>
          <ImageEditor />
        </div>
      </div>
  );
}

export default App;
