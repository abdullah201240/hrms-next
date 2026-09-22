"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Site-wide searchable dropdown. Wraps the shadcn (Base UI) Combobox so every
 * picker looks and behaves the same: type-to-filter, clear button, empty state,
 * and an optional "+ Add {Doctype}" quick-create (self-contained dialog that
 * appends the new option and selects it — mirroring Frappe HR link fields).
 */
export type SearchOption = { value: string; label: string };
type SearchSelectProps = {
  options: readonly (string | SearchOption)[];
  placeholder?: string;
  addLabel?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
} & (
  | { multiple?: false; value: string; onChange: (value: string) => void }
  | { multiple: true; value: string[]; onChange: (value: string[]) => void }
);

export function SearchSelect(props: SearchSelectProps) {
  if (!props.multiple && props.options.every((item) => typeof item === "string")) {
    return <StringSearchSelect {...props} options={props.options as readonly string[]} />;
  }
  return <RecordSearchSelect {...props} />;
}

function RecordSearchSelect(props: SearchSelectProps) {
  const anchor = useComboboxAnchor();
  const options = props.options.map((item) => typeof item === "string" ? { value: item, label: item } : item);
  const filter = (item: SearchOption, query: string) => item.label.toLowerCase().includes(query.toLowerCase());
  const content = <><ComboboxList><ComboboxCollection>{(item: SearchOption) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxCollection></ComboboxList><ComboboxEmpty>No matches found.</ComboboxEmpty></>;
  if (props.multiple) {
    return <Combobox<SearchOption, true> multiple items={options} disabled={props.disabled} filter={filter}
      value={options.filter((item) => props.value.includes(item.value))}
      isItemEqualToValue={(a, b) => a.value === b.value}
      onValueChange={(items) => props.onChange(items.map((item) => item.value))}>
      <ComboboxChips ref={anchor} className={props.className ?? "w-full"}>
        <ComboboxValue>{(items: SearchOption[]) => items.map((item) => <ComboboxChip key={item.value} aria-label={item.label}>{item.label}</ComboboxChip>)}</ComboboxValue>
        <ComboboxChipsInput id={props.id} aria-label={props.placeholder ?? "Select options"} placeholder={props.placeholder ?? "Search…"} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>{content}</ComboboxContent>
    </Combobox>;
  }
  return <Combobox<SearchOption> items={options} disabled={props.disabled} filter={filter}
    value={options.find((item) => item.value === props.value) ?? null}
    isItemEqualToValue={(a, b) => a.value === b.value}
    onValueChange={(item) => props.onChange(item?.value ?? "")}>
    <ComboboxInput id={props.id} aria-label={props.placeholder ?? "Select option"} placeholder={props.placeholder ?? "Search…"} disabled={props.disabled} showClear className={props.className ?? "w-full"} />
    <ComboboxContent>{content}</ComboboxContent>
  </Combobox>;
}

function StringSearchSelect({
  value,
  onChange,
  options,
  placeholder = "Search\u2026",
  addLabel,
  id,
  className = "w-full",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  /** When set, shows "+ Add {addLabel}" and enables quick-create. */
  addLabel?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [extra, setExtra] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const all = [...options, ...extra];

  const confirmAdd = () => {
    const n = newName.trim();
    if (!n) {
      toast.error("Name is required.");
      return;
    }
    setExtra((e) => (e.includes(n) ? e : [...e, n]));
    onChange(n);
    toast.success(`${n} added to ${addLabel}`);
    setAdding(false);
    setNewName("");
  };

  return (
    <>
      <Combobox
        items={all}
        disabled={disabled}
        // Base UI ships no default filter — case-insensitive substring match.
        filter={(item: string, query: string) => item.toLowerCase().includes(query.toLowerCase())}
        value={value || null}
        onValueChange={(val) => {
          if (val === "__add__") {
            setNewName("");
            setAdding(true);
            return;
          }
          onChange(val ?? "");
        }}
      >
        <ComboboxInput id={id} aria-label={placeholder} placeholder={placeholder} disabled={disabled} showClear className={className} />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxCollection>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxCollection>
            {addLabel && (
              <>
                <ComboboxSeparator />
                <ComboboxItem value="__add__" className="text-muted-foreground">
                  + Add {addLabel}
                </ComboboxItem>
              </>
            )}
          </ComboboxList>
          <ComboboxEmpty>No matches found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>

      {addLabel && (
        <Dialog open={adding} onOpenChange={(o) => { if (!o) setAdding(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {addLabel}</DialogTitle>
              <DialogDescription>
                Create a new {addLabel.toLowerCase()} and select it right away.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="search-select-add">Name</Label>
              <Input
                id="search-select-add"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmAdd();
                  }
                }}
                placeholder={`Enter ${addLabel.toLowerCase()} name`}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={confirmAdd}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
