import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  debouncedSyncWithStorage,
  emptyItem,
  getFromStorage,
  syncWithStorage,
} from './utils';

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
    <div className="text-gray-100 h-full bg-slate-300 scrollbar-hide">
      <div className="flex flex-row bg-slate-600 space-x-1 justify-between px-2">
        <span />
        <Button
          className="my-2"
          onClick={() => save([...items, emptyItem()], false)}
        >
          <AddIcon /> Add note
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
        <ItemContent
          key={selectedItemId}
          item={selectedItem}
          onChange={handleChangeItem}
        />
      </div>
    </div>
  );
}

function Button(props) {
  return (
    <button
      {...props}
      className={
        (props.className ?? '') +
        ' bg-slate-700 py-1 px-4 rounded-2xl hover:bg-slate-900 '
      }
    />
  );
}

function TheList({ items, selected, onSave, onClick, onDelete }) {
  const [editing, setEditing] = React.useState(null);

  return (
    <div className="bg-slate-500 min-h-max h-64 flex flex-col overflow-y-auto scrollbar-hide">
      {items.map((item) => (
        <div
          key={item.id}
          className={
            'flex flex-row align-items-center justify-between py-2 px-2 cursor-pointer hover:bg-slate-400 ' +
            (item.id == selected ? 'bg-slate-400' : '')
          }
          onDoubleClick={() => setEditing(item.id)}
          onClick={() => onClick(item)}
        >
          <span className="flex content-center flex-wrap">
            {' '}
            {editing == item.id ? (
              <form
                onSubmit={(evt) => {
                  evt.preventDefault();
                  setEditing(null);
                }}
              >
                <input
                  onBlur={() => setEditing(null)}
                  name="title"
                  className="form-control bg-slate-500 text-slate-100 border-0 focus:outline-none focus:px-2 rounded"
                  value={item.title}
                  onChange={(evt) =>
                    onSave({ ...item, title: evt.target.value })
                  }
                />
              </form>
            ) : (
              item.title
            )}
          </span>
          <Button onClick={() => onDelete(item)} className="text-sm px-2 py-1 flex content-center">
            <DeleteIcon sx={{fontSize: "1.1em"}} />
          </Button>
        </div>
      ))}
    </div>
  );
}

function ItemContent({ item, onChange }) {
  return (
    <div className="bg-slate-300 overflow-y-auto min-h-max h-80 scrollbar-hide">
      <textarea
        disabled={!item}
        className="form-control py-1 px-2 w-full bg-slate-300 h-full focus:outline-none text-slate-800"
        placeholder={
          item ? 'Enter your note content here' : 'Select a note to edit'
        }
        value={item?.content ?? ''}
        onChange={(event) => onChange({ ...item, content: event.target.value })}
      />
    </div>
  );
}
