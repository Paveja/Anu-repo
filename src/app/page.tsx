const numbers = Array.from({ length: 100 }, (_, index) => index + 1);

export default function Home() {
  return (
    <main className="bg-ink text-paper min-h-screen overflow-hidden px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:gap-14">
        <header className="border-paper/15 flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10 lg:pb-10">
          <div className="max-w-2xl">
            <p className="text-amber mb-4 font-mono text-[0.68rem] font-medium tracking-[0.28em] uppercase">
              Reference chart / 01—100
            </p>
            <h1 className="font-display text-paper text-5xl leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-[6.5rem]">
              The number board
            </h1>
          </div>
          <p className="text-paper/60 max-w-xs pb-1 text-sm leading-6 sm:text-right">
            A clear field for counting, checking, and finding your place in the sequence.
          </p>
        </header>

        <section
          aria-labelledby="chart-heading"
          className="bg-paper text-ink rounded-[1.75rem] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.24)] sm:p-5 lg:p-7"
        >
          <h2 id="chart-heading" className="sr-only">
            Numbers one through one hundred
          </h2>
          <ol className="border-ink/10 grid grid-cols-5 overflow-hidden rounded-xl border sm:grid-cols-8 lg:grid-cols-10">
            {numbers.map((number) => (
              <li
                key={number}
                className="group border-ink/10 hover:bg-amber hover:text-ink focus-within:bg-amber relative flex aspect-square items-center justify-center border-r border-b font-mono text-lg font-medium tabular-nums transition-colors duration-200 last:border-r-0 sm:text-xl lg:text-2xl"
              >
                <span className="relative z-10">{number}</span>
                <span
                  aria-hidden="true"
                  className="group-hover:border-ink/20 absolute inset-1 rounded-lg border border-transparent transition-colors duration-200"
                />
              </li>
            ))}
          </ol>
        </section>

        <footer className="text-paper/60 flex flex-col gap-2 text-xs tracking-[0.2em] uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>One through one hundred</span>
          <span>Read left to right / top to bottom</span>
        </footer>
      </div>
    </main>
  );
}

export const dynamic = 'force-static';
