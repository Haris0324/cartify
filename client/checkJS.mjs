fetch('https://cartify-frontend-khaki.vercel.app/assets/index-pvPagwNk.js')
  .then(res => res.text())
  .then(text => {
    const lines = text.split('\n');
    let hasRoot = text.includes('getElementById("root")') || text.includes("getElementById('root')");
    let hasRootDiv = text.includes('getElementById("root-div")') || text.includes("getElementById('root-div')");
    
    console.log("hasRoot:", hasRoot);
    console.log("hasRootDiv:", hasRootDiv);
    
    // Check for VITE_API_URL or environment variable usages in the bundle
    let hasEnvError = false; 
    process.exit(0);
  });
