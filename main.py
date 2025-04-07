app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000", "https://kodoninja.com"],  # Add production domains later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
