import re

def main():
    file_path = 'src/app/estimate/page.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Navbar & Main Container responsive adjustments
    content = content.replace(
        '<Navbar />',
        '{!isSimulation && <Navbar />}'
    )
    content = content.replace(
        '<main className="flex-1 container mx-auto px-4 py-8 lg:py-24">',
        '<main className={`flex-1 container mx-auto ${isSimulation ? \'px-2 py-2\' : \'px-4 py-8 lg:py-24\'}`}>\n        <div className={`max-w-2xl mx-auto ${isSimulation ? \'space-y-3\' : \'space-y-6 sm:space-y-8\'}`}>\n          {/* Note: the matching close tags are below */}'
    )
    # Since we wrapped the main in a new div or added className, let's check the container layout.
    # Wait, the original code had:
    # <main className="flex-1 container mx-auto px-4 py-8 lg:py-24">
    #   <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
    # Let's replace both together to avoid duplicate/extra divs.
    # Let's restore the original file and do a clean replace:
    
    # We will reread and apply exact replaces:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Main outer layout
    content = content.replace(
        '<main className="flex-1 container mx-auto px-4 py-8 lg:py-24">\n        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">',
        '<main className={`flex-1 container mx-auto ${isSimulation ? \'px-2 py-2\' : \'px-4 py-8 lg:py-24\'}`}>\n        <div className={`max-w-2xl mx-auto ${isSimulation ? \'space-y-3\' : \'space-y-6 sm:space-y-8\'}`}>'
    )

    # 2. Navbar check
    content = content.replace(
        '<Navbar />',
        '{!isSimulation && <Navbar />}'
    )

    # 3. Card rounded classes
    content = content.replace(
        'Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white animate-in',
        'Card className="premium-card rounded-2xl sm:rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white animate-in'
    )
    content = content.replace(
        'Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in',
        'Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in'
    )
    content = content.replace(
        'Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden',
        'Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden'
    )
    content = content.replace(
        'Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white',
        'Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white'
    )
    content = content.replace(
        'Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden',
        'Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-sm overflow-hidden'
    )
    content = content.replace(
        'Card className="premium-card rounded-[3rem] border-none shadow-2xl py-32 text-center bg-slate-900 text-white relative overflow-hidden',
        'Card className="premium-card rounded-2xl sm:rounded-[3rem] border-none shadow-2xl py-12 sm:py-32 text-center bg-slate-900 text-white relative overflow-hidden'
    )

    # 4. CardHeader py classes
    content = content.replace(
        'CardHeader className="text-center py-12 bg-slate-900 text-white relative"',
        'CardHeader className="text-center py-6 sm:py-12 bg-slate-900 text-white relative"'
    )
    content = content.replace(
        'CardHeader className="text-center py-10 bg-slate-900 text-white relative"',
        'CardHeader className="text-center py-5 sm:py-10 bg-slate-900 text-white relative"'
    )
    content = content.replace(
        'CardHeader className="text-center py-8 sm:py-12 bg-slate-50/50 relative"',
        'CardHeader className="text-center py-4 sm:py-12 bg-slate-50/50 relative"'
    )
    content = content.replace(
        'CardHeader className="text-center bg-slate-50/50 py-6 sm:py-10 border-b border-slate-100 relative"',
        'CardHeader className="text-center bg-slate-50/50 py-4 sm:py-10 border-b border-slate-100 relative"'
    )
    content = content.replace(
        'CardHeader className="text-center py-6 sm:py-10 bg-slate-50/50 border-b border-slate-100"',
        'CardHeader className="text-center py-4 sm:py-10 bg-slate-50/50 border-b border-slate-100"'
    )
    content = content.replace(
        'CardHeader className="text-center py-8 sm:py-12 bg-white"',
        'CardHeader className="text-center py-4 sm:py-12 bg-white"'
    )
    content = content.replace(
        'CardHeader className="text-center py-16 bg-slate-50/50 relative"',
        'CardHeader className="text-center py-8 sm:py-16 bg-slate-50/50 relative"'
    )
    content = content.replace(
        'CardHeader className="text-center py-12 bg-red-50/50 border-b border-red-100"',
        'CardHeader className="text-center py-6 sm:py-12 bg-red-50/50 border-b border-red-100"'
    )

    # 5. CardContent padding / spacing
    content = content.replace(
        'CardContent className="p-8 sm:p-12 space-y-12"',
        'CardContent className="p-4 sm:p-12 space-y-6 sm:space-y-12"'
    )
    content = content.replace(
        'CardContent className="p-6 sm:p-10 space-y-8 bg-slate-50/50"',
        'CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-8 bg-slate-50/50"'
    )
    content = content.replace(
        'CardContent className="p-6 sm:p-10 space-y-8"',
        'CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-8"'
    )
    content = content.replace(
        'CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-10"',
        'CardContent className="space-y-4 sm:space-y-8 p-4 sm:p-10"'
    )
    content = content.replace(
        'CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8"',
        'CardContent className="p-4 sm:p-10 space-y-4 sm:space-y-8"'
    )
    content = content.replace(
        'CardContent className="p-6 sm:p-10 space-y-6"',
        'CardContent className="p-4 sm:p-10 space-y-4 sm:space-y-6"'
    )
    content = content.replace(
        'CardContent className="p-10 space-y-10"',
        'CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-10"'
    )
    content = content.replace(
        'CardContent className="space-y-16 py-16 px-10"',
        'CardContent className="space-y-8 sm:space-y-16 py-8 sm:py-16 px-4 sm:px-10"'
    )
    content = content.replace(
        'CardContent className="space-y-10 p-10"',
        'CardContent className="space-y-6 sm:space-y-10 p-4 sm:p-10"'
    )
    content = content.replace(
        'CardContent className="p-8 sm:p-12 text-center space-y-6"',
        'CardContent className="p-4 sm:p-12 text-center space-y-4 sm:space-y-6"'
    )

    # 6. CardTitle and sizes
    content = content.replace(
        'CardTitle className="text-3xl font-black font-headline tracking-tight">',
        'CardTitle className="text-2xl sm:text-3xl font-black font-headline tracking-tight">'
    )
    content = content.replace(
        'CardTitle className="text-2xl sm:text-3xl font-black break-keep">{t(\'Step 2: 외국인등록증 정보\')}</CardTitle>',
        'CardTitle className="text-xl sm:text-3xl font-black break-keep">{t(\'Step 2: 외국인등록증 정보\')}</CardTitle>'
    )
    content = content.replace(
        'CardTitle className="text-2xl sm:text-3xl font-black break-keep">{t(\'Step 2: 외국인등록증 정보 입력\')}</CardTitle>',
        'CardTitle className="text-xl sm:text-3xl font-black break-keep">{t(\'Step 2: 외국인등록증 정보 입력\')}</CardTitle>'
    )
    content = content.replace(
        'CardTitle className="text-2xl sm:text-3xl font-black break-keep">\n                    {t(\'Step 3: 휴대폰 본인인증\')}',
        'CardTitle className="text-xl sm:text-3xl font-black break-keep">\n                    {t(\'Step 3: 휴대폰 본인인증\')}'
    )
    content = content.replace(
        'CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">{t(\'Step 4: 간편인증 선택\')}</CardTitle>',
        'CardTitle className="text-xl sm:text-3xl font-black text-slate-900 break-keep">{t(\'Step 4: 간편인증 선택\')}</CardTitle>'
    )
    content = content.replace(
        'CardTitle className="text-3xl font-black text-slate-900">{t(\'Step 5: 국세청 연동\')}</CardTitle>',
        'CardTitle className="text-2xl sm:text-3xl font-black text-slate-900">{t(\'Step 5: 국세청 연동\')}</CardTitle>'
    )
    content = content.replace(
        'CardTitle className="text-4xl lg:text-[2.5rem] font-black font-headline text-slate-900 leading-tight">',
        'CardTitle className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black font-headline text-slate-900 leading-tight">'
    )
    content = content.replace(
        'CardTitle className="text-3xl font-black font-headline">{t(\'Step 8: 수수료 입금\')}</CardTitle>',
        'CardTitle className="text-2xl sm:text-3xl font-black font-headline">{t(\'Step 8: 수수료 입금\')}</CardTitle>'
    )
    content = content.replace(
        'CardTitle className="text-3xl font-black font-headline">{t(\'Step 9: 최종 신청\')}</CardTitle>',
        'CardTitle className="text-2xl sm:text-3xl font-black font-headline">{t(\'Step 9: 최종 신청\')}</CardTitle>'
    )

    # 7. Step 0 inner sub-card responsive adjustment
    content = content.replace(
        '<div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/20 relative overflow-hidden animate-in fade-in zoom-in duration-700">',
        '<div className="p-4 sm:p-6 bg-primary/5 rounded-2xl sm:rounded-[2.5rem] border border-primary/20 relative overflow-hidden animate-in fade-in zoom-in duration-700">'
    )
    content = content.replace(
        '<p className="font-black text-slate-800 text-[22px] leading-tight">{t(\'대상 연령 안내 (실시간 업데이트)\')}</p>',
        '<p className="font-black text-slate-800 text-lg sm:text-[22px] leading-tight">{t(\'대상 연령 안내 (실시간 업데이트)\')}</p>'
    )
    content = content.replace(
        'Badge className="bg-primary text-white border-none font-black text-[18px] px-6 py-2.5 rounded-2xl shadow-xl shadow-primary/20"',
        'Badge className="bg-primary text-white border-none font-black text-sm sm:text-[18px] px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20"'
    )
    content = content.replace(
        '<div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-2xl border-2 border-primary/10 shadow-sm">',
        '<div className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-primary/10 shadow-sm">'
    )
    content = content.replace(
        '<p className="text-[20px] font-black text-slate-700 leading-none mt-0.5">',
        '<p className="text-sm sm:text-[20px] font-black text-slate-700 leading-none mt-0.5">'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Mobile optimization successfully applied to src/app/estimate/page.tsx")

if __name__ == '__main__':
    main()
