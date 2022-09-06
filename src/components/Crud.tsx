import { useRef } from "react";
import useSWR, { useSWRConfig } from 'swr'

export default function Crud() {
  const titleRef = useRef();
  const descRef = useRef();

  const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data.data;
  };
  
  const { mutate } = useSWRConfig()
  const { data, error } = useSWR("/api/crud", fetcher);

  const submitHandler = async (e) => {
    e.preventDefault();
    const data = {
      title: titleRef.current.value,
      desc: descRef.current.value,
    };
    const response = await fetch("/api/crud", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(result);
    mutate("/api/crud")
  };

  const deleteHandler = async (title) => {
    const response = await fetch("/api/crud", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });
    const result = await response.json();
    console.log(result);
    mutate("/api/crud")
  }

  return (
    <div>
      <h1>Crud</h1>
      <form
        onSubmit={submitHandler}
        className="flex flex-col items-center gap-1"
      >
        <label htmlFor="title">Title</label>
        <input
          className="p-2 px-5 border-2 border-black"
          type="text"
          name="title"
          id="title"
          placeholder="Title..."
          ref={titleRef}
        />
        <label htmlFor="desc">Desc</label>
        <input
          className="p-2 px-5 border-2 border-black"
          type="text"
          name="desc"
          id="desc"
          placeholder="Desc..."
          ref={descRef}
        />
        <button className="bg-green-300 px-5 p-2">Submit</button>
      </form>
      <div className='mt-10'>
        {data &&
          data?.map((item, i) => (
            <div
              className="flex flex-col border-2 border-black bg-slate-300 gap-2 items-center p-2"
              key={i}
            >
              <h1>{item.title}</h1>
              <p>{item.desc}</p>
              <button className='bg-red-300 px-5 p-2' onClick={() => deleteHandler(item.title)}>Delete</button>
            </div>
          ))}
          {!data && <h1 className='text-center'>Loading...</h1>}
          {data && data.length === 0 && <h1 className='text-center'>No data</h1>}
      </div>
    </div>
  );
}
