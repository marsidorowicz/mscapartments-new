"use client";
import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Image from "next/image";
import { countries } from "./countries";

interface CountryCodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CountryCodeAutocomplete({
  value,
  onChange,
}: CountryCodeAutocompleteProps) {
  // Use "48" as default value
  // Find country or fallback to custom input
  const cleanValue = value.replace(/\D/g, "");
  const selectedOption = countries.find((c) => c.phone === cleanValue) || {
    code: "UN",
    label: "Custom",
    phone: cleanValue || "",
  };

  return (
    <Autocomplete
      options={countries}
      autoHighlight
      freeSolo
      disableClearable
      value={selectedOption}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          onChange(newValue.replace(/\D/g, ""));
        } else if (newValue && newValue.phone) {
          onChange(newValue.phone);
        }
      }}
      onInputChange={(event, newInputValue) => {
        // As user types, update the value just like that
        if (newInputValue !== undefined && newInputValue !== null) {
          onChange(newInputValue.replace(/\D/g, ""));
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") return `+${option.replace(/\D/g, "")}`;
        return `+${option.phone}`;
      }}
      isOptionEqualToValue={(option, value) => option.phone === value.phone}
      renderOption={(props, option) => {
        const itemProps = props as React.HTMLAttributes<HTMLLIElement> & {
          key?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { key: _key, ...otherProps } = itemProps;
        return (
          <li
            key={option.code}
            {...otherProps}
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
            style={{
              display: "flex",
              gap: "8px",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            <Image
              src={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png`}
              alt={option.label}
              width={20}
              height={15}
              style={{ flexShrink: 0, height: "auto" }}
            />
            <span
              style={{
                fontSize: "14px",
                color: "gray",
                whiteSpace: "nowrap",
                flexGrow: 1,
              }}
            >
              +{option.phone}
            </span>
          </li>
        );
      }}
      sx={{ width: 100 }}
      slotProps={{
        paper: {
          sx: {
            width: 250,
          },
        },
      }}
      renderInput={(params) => {
        const { InputProps, inputProps } = params;
        return (
          <div
            ref={InputProps.ref}
            className="flex h-full items-center justify-center bg-gray-50 px-2 sm:px-3 text-sm text-black border-r border-gray-300 w-full shrink-0"
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              backgroundColor: "#f9fafb",
              borderRight: "1px solid #d1d5db",
              padding: "0 8px",
            }}
          >
            {selectedOption.code !== "UN" ? (
              <Image
                src={`https://flagcdn.com/w40/${selectedOption.code.toLowerCase()}.png`}
                alt={selectedOption.label}
                width={20}
                height={15}
                className="mr-1 mt-0.5"
                style={{ marginRight: "4px", height: "auto" }}
              />
            ) : (
              <div style={{ width: 20, height: 15, marginRight: "4px" }} />
            )}
            <input
              {...inputProps}
              value={inputProps.value || "+" + selectedOption.phone}
              className="w-full bg-transparent outline-none cursor-pointer p-0 m-0 border-none min-w-0"
              style={{
                background: "transparent",
                outline: "none",
                cursor: "pointer",
                border: "none",
                width: "35px",
                padding: 0,
              }}
            />
          </div>
        );
      }}
    />
  );
}
