def main():
    file_path = 'src/app/estimate/page.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. h-24 button replacements
    content = content.replace(
        'className="w-full h-24 bg-slate-200 hover:bg-slate-300 text-slate-700 text-2xl lg:text-3xl font-black rounded-[2rem] shadow-sm',
        'className="w-full h-14 sm:h-24 bg-slate-200 hover:bg-slate-300 text-slate-700 text-base sm:text-3xl font-black rounded-2xl sm:rounded-[2rem] shadow-sm'
    )
    content = content.replace(
        'className="w-full h-24 bg-slate-900 text-2xl lg:text-3xl font-black rounded-[2rem] shadow-2xl',
        'className="w-full h-14 sm:h-24 bg-slate-900 text-base sm:text-3xl font-black rounded-2xl sm:rounded-[2rem] shadow-2xl'
    )
    content = content.replace(
        'className="w-full h-24 bg-primary text-3xl font-black rounded-[2rem] shadow-xl shadow-primary/20',
        'className="w-full h-14 sm:h-24 bg-primary text-base sm:text-3xl font-black rounded-2xl sm:rounded-[2rem] shadow-xl shadow-primary/20'
    )
    content = content.replace(
        'className="w-full h-24 bg-slate-900 text-3xl font-black rounded-[2rem] shadow-xl',
        'className="w-full h-14 sm:h-24 bg-slate-900 text-base sm:text-3xl font-black rounded-2xl sm:rounded-[2rem] shadow-xl'
    )
    content = content.replace(
        'className="w-full h-24 bg-slate-900 text-3xl font-black rounded-[2rem] shadow-2xl transition-all',
        'className="w-full h-14 sm:h-24 bg-slate-900 text-base sm:text-3xl font-black rounded-2xl sm:rounded-[2rem] shadow-2xl transition-all'
    )

    # 2. h-20 button replacements
    content = content.replace(
        'className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-xl font-black rounded-3xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"',
        'className="w-full h-14 sm:h-20 bg-slate-900 hover:bg-slate-800 text-base sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"'
    )
    content = content.replace(
        'className="w-full h-20 bg-primary text-xl sm:text-2xl font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"',
        'className="w-full h-14 sm:h-20 bg-primary text-base sm:text-2xl font-black rounded-2xl sm:rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"'
    )
    content = content.replace(
        'className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"',
        'className="w-full h-14 sm:h-20 bg-primary text-base sm:text-2xl font-black rounded-2xl sm:rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"'
    )
    content = content.replace(
        'className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20"',
        'className="w-full h-14 sm:h-20 bg-primary text-base sm:text-2xl font-black rounded-2xl sm:rounded-3xl shadow-xl shadow-primary/20"'
    )
    content = content.replace(
        'className="w-full h-20 bg-primary text-xl font-black rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"',
        'className="w-full h-14 sm:h-20 bg-primary text-base sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"'
    )
    content = content.replace(
        'className="w-full h-20 border-primary text-primary hover:bg-primary/5 text-xl font-black rounded-3xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-3"',
        'className="w-full h-14 sm:h-20 border-primary text-primary hover:bg-primary/5 text-base sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-3"'
    )
    content = content.replace(
        '"w-full h-20 text-xl font-black rounded-3xl shadow-xl transition-all hover:scale-[1.02]"',
        '"w-full h-14 sm:h-20 text-base sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-xl transition-all hover:scale-[1.02]"'
    )

    # 3. Input field replacements (h-16 to h-12/16)
    content = content.replace(
        'className="h-16 px-6 rounded-2xl bg-white border-2 border-slate-100 font-black text-lg w-full outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-12"',
        'className="h-12 sm:h-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-100 font-black text-base sm:text-lg w-full outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-12"'
    )
    content = content.replace(
        'className="h-16 rounded-2xl font-bold bg-slate-50 border-none pl-12 pr-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"',
        'className="h-12 sm:h-16 rounded-xl sm:rounded-2xl font-bold bg-slate-50 border-none pl-10 pr-4 sm:pl-12 sm:pr-6 text-base sm:text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"'
    )
    content = content.replace(
        'className="h-16 rounded-2xl font-bold bg-slate-50 border-none px-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"',
        'className="h-12 sm:h-16 rounded-xl sm:rounded-2xl font-bold bg-slate-50 border-none px-4 sm:px-6 text-base sm:text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"'
    )
    content = content.replace(
        '<SelectTrigger id="step9-bank-select" className="h-16 rounded-2xl font-bold bg-slate-50 border-none px-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20">',
        '<SelectTrigger id="step9-bank-select" className="h-12 sm:h-16 rounded-xl sm:rounded-2xl font-bold bg-slate-50 border-none px-4 sm:px-6 text-base sm:text-lg w-full outline-none focus:ring-2 focus:ring-primary/20">'
    )

    # 4. Additional rounded-[3rem] card and div replacements
    content = content.replace(
        'Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white"',
        'Card className="premium-card rounded-2xl sm:rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white"'
    )
    content = content.replace(
        'rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95',
        'rounded-2xl sm:rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Buttons, inputs, and card rounded mobile optimization applied successfully.")

if __name__ == '__main__':
    main()
