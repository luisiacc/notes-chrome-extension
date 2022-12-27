import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { debouncedSyncWithStorage, emptyItem, getFromStorage, syncWithStorage } from "./utils";

export default function App() {
  const [items, setItems] = React.useState([]);
  const [selectedItemId, setSelectedItem] = React.useState(null);

  React.useEffect(() => {
    getFromStorage().then(setItems);
  }, []);

  function save(newItems, debounce = true) {
    setItems(newItems);
    if (debounce) {
      debouncedSyncWithStorage(newItems);
    } else {
      syncWithStorage(newItems);
    }
  }

  function handleChangeItem(item, debounce = true) {
    const newItems = items.map((i) => {
      if (i.id === item.id) {
        return item;
      }
      return i;
    });
    save(newItems, debounce);
  }

  const selectedItem = items.find((i) => i.id === selectedItemId);

  return (
    <div className="text-gray-100 h-full scrollbar-hide transition-all">
      <div className="flex flex-row space-x-1 justify-between px-2">
        <span />
        <Button className="my-2 mr-2 py-0" onClick={() => save([...items, emptyItem()], false)}>
          <AddIcon /> <span>Add note</span>
        </Button>
      </div>
      <div className="h-max flex-col ">
        <TheList
          items={items}
          selected={selectedItemId}
          onSave={(item) => handleChangeItem(item, false)}
          onClick={(item) => setSelectedItem(item.id)}
          onDelete={(oldItem) =>
            save(
              items.filter((item) => item.id != oldItem.id),
              false
            )
          }
        />
        <ItemContent key={selectedItemId} item={selectedItem} onChange={handleChangeItem} />
      </div>
    </div>
  );
}

function Button(props) {
  return (
    <button
      {...props}
      className={
        (props.className ?? "") + " bg-sky-500 py-1 px-4 rounded-2xl hover:bg-sky-700 flex flex-row items-center"
      }
    />
  );
}

function TheList({ items, selected, onSave, onClick, onDelete }) {
  const [parent] = useAutoAnimate();

  return (
    <div ref={parent} className="bg-sky-100 min-h-max h-64 flex flex-col overflow-y-auto scrollbar-hide">
      {items.map((item, i) => (
        <NoteItem
          i={i}
          key={item.id}
          selected={selected}
          item={item}
          onSave={onSave}
          onClick={onClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function NoteItem({ i, onSave, onClick, onDelete, item, selected }) {
  const [editing, setEditing] = React.useState(false);
  const ref = React.useRef(null);

  function select() {
    setEditing(true);
  }

  React.useEffect(() => {
    if (editing) {
      ref.current.focus();
      ref.current.selectionStart = ref.current.value.length;
      ref.current.selectionEnd = ref.current.value.length;
    }
  }, [editing]);

  return (
    <div
      key={item.id}
      className={
        "flex flex-row text-gray-700 align-items-center justify-between py-2 px-2 cursor-pointer" +
        (selected == item.id ? " bg-sky-500" : i % 2 == 0 ? " bg-sky-200" : "")
      }
      onClick={() => onClick(item)}
    >
      <span className="flex content-center flex-wrap">
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            setEditing(false);
          }}
        >
          <input
            disabled={!editing}
            type="text"
            ref={ref}
            onBlur={() => setEditing(false)}
            name="title"
            className="form-control bg-inherit text-gray-700 border-0 focus:outline-none rounded cursor-pointer focus:cursor-text focus:border-b-2 focus:border-sky-700"
            value={item.title}
            onChange={(evt) => onSave({ ...item, title: evt.target.value })}
          />
        </form>
      </span>
      <div className="flex flex-row gap-1">
        <Button
          onClick={(evt) => {
            evt.stopPropagation();
            select();
          }}
          className="text-sm px-2 py-1 flex text-gray-100 content-center"
        >
          <EditIcon sx={{ fontSize: "1.1em" }} />
        </Button>
        <Button
          onClick={(evt) => {
            evt.stopPropagation();
            onDelete(item);
          }}
          className="text-sm px-2 py-1 flex text-gray-100 content-center"
        >
          <DeleteIcon sx={{ fontSize: "1.1em" }} />
        </Button>
      </div>
    </div>
  );
}

function ItemContent({ item, onChange }) {
  return (
    <div className="bg-sky-100 overflow-y-auto min-h-max h-80 scrollbar-hide border-t border-sky-200">
      <textarea
        disabled={!item}
        className="form-control py-1 px-2 w-full bg-sky-100 h-full focus:outline-none text-gray-700 overflow-y-none"
        style={{ resize: "none" }}
        placeholder={item ? "Enter your note content here" : "Select a note to edit"}
        value={item?.content ?? ""}
        onChange={(event) => onChange({ ...item, content: event.target.value })}
      />
    </div>
  );
}
