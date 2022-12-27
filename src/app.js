import * as React from 'react';
import {
  debouncedSyncWithStorage,
  emptyItem,
  getFromStorage,
  saveToStorage,
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

  function handleChangeContent(item) {
    const newItems = items.map((i) => {
      if (i.id === item.id) {
        return item;
      }
      return i;
    });
    save(newItems);
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
          + Add note
        </Button>
      </div>
      <div className="h-max flex-col ">
        <TheList
          items={items}
          selected={selectedItemId}
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
          onChange={handleChangeContent}
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
        'bg-slate-700 py-1 px-4 rounded-2xl hover:bg-slate-900 ' +
        (props.className ?? '')
      }
    />
  );
}

function TheList({ items, selected, onClick, onDelete }) {
  return (
    <div className="bg-slate-500 min-h-max h-64 flex flex-col overflow-y-auto scrollbar-hide">
      {items.map((item) => (
        <div
          key={item.id}
          className={
            'flex flex-row justify-between py-2 px-2 cursor-pointer hover:bg-slate-400 ' +
            (item.id == selected ? 'bg-slate-400' : '')
          }
          onClick={() => onClick(item)}
        >
          <span> {item.title}</span>
          <Button onClick={() => onDelete(item)}>-</Button>
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
