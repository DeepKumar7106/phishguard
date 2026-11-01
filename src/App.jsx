import './App.css'
import DisplayContainer from './components/DisplayContainer'
import Header from './components/Header'
import UserInput from './components/UserInput'
function App() {

  return (
    <div className="App bg-background flex flex-col items-center p-5 gap-y-9 min-h-screen">
      <Header />
      <UserInput />
      <DisplayContainer />
    </div>
  )
}

export default App





// import React, { useState } from 'react';
// import ScamTrendChart from './ScamTrendChart';

// export default function App() {
//   const [query, setQuery] = useState('');
//   const [searchedValue, setSearchedValue] = useState('');

//   const handleSearch = (e) => {
//     e.preventDefault();
//     setSearchedValue(query);
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 space-y-6">
//       <form onSubmit={handleSearch} className="flex gap-2">
//         <input 
//           type="text" 
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Enter domain (e.g. google-careers-secure.com) or email..."
//           className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button type="submit" className="px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
//           Check Trend
//         </button>
//       </form>

//       {/* Renders line chart dynamically when search is triggered */}
//       <ScamTrendChart searchQuery={searchedValue} />
//     </div>
//   );
// }
