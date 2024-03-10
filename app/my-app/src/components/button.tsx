export function TheRedButton({ children }: Readonly<{ children: React.ReactNode }>) {
  return <button className="bg-red-700">{children}</button>
}

export function TheGreenButton({ children }: Readonly<{ children: React.ReactNode }>) {
  return <button className="bg-green-500">{children}</button>
}
