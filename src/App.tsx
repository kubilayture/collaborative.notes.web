import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

function App() {
  return (
    <>
      <main className="max-w-xl justify-center flex items-center mx-auto h-screen flex-col gap-5">
        <h1 className="text-3xl font-bold text-amber-500">
          Collaborative Note App
        </h1>
        <Button variant={"secondary"}>button</Button>
        <Input placeholder="placeholder" />
      </main>
    </>
  );
}

export default App;
