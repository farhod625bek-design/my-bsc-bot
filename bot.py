# ... avvalgi kodlar ...

print("✅ BOT ISHGA TUSHDI", flush=True)
print("🌐 Network: BNB Smart Chain", flush=True)
print("💰 TREASURY:", TREASURY, flush=True)

while True:
    try:
        block = w3.eth.block_number
        print(f"⏳ Bot tirik | Hozirgi block: {block}", flush=True)
        time.sleep(15)
    except Exception as e:
        print("❌ Xato:", e, flush=True)
        time.sleep(10)
