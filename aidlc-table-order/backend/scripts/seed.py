"""Seed script: 클라이언트 개발자 테스트용 초기 데이터 생성.

Usage:
    cd backend && uv run python scripts/seed.py
"""

import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from cores.config import settings
from cores.db.models import Base
from cores.db.models.store import Store
from cores.db.models.admin import Admin
from cores.db.models.table import Table
from cores.db.models.category import Category
from cores.db.models.menu import Menu
from cores.db.models.option_group import OptionGroup
from cores.db.models.option_item import OptionItem
from cores.db.models.menu_option_group import MenuOptionGroup
from cores.security.password import hash_password


async def seed():
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        # ── Store ──
        store_id = uuid.uuid4()
        store = Store(id=store_id, name="오웬의 분식집", default_prep_time_minutes=15)
        db.add(store)

        # ── Admin ──
        admin = Admin(
            id=uuid.uuid4(),
            store_id=store_id,
            username="admin",
            password_hash=hash_password("admin1234"),
            login_attempts=0,
        )
        db.add(admin)

        # ── Tables (1~5번) ──
        table_ids = []
        for num in range(1, 6):
            tid = uuid.uuid4()
            table_ids.append(tid)
            db.add(Table(
                id=tid,
                store_id=store_id,
                table_number=num,
                password_hash=hash_password(f"table{num}"),
            ))

        # ── Categories ──
        cat_main = Category(id=uuid.uuid4(), store_id=store_id, name="메인 메뉴", sort_order=1)
        cat_side = Category(id=uuid.uuid4(), store_id=store_id, name="사이드", sort_order=2)
        cat_drink = Category(id=uuid.uuid4(), store_id=store_id, name="음료", sort_order=3)
        db.add_all([cat_main, cat_side, cat_drink])

        # ── Menus ──
        menus = [
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_main.id,
                 name="떡볶이", price=5000, description="매콤달콤 국민 간식",
                 sort_order=1, is_popular=True, is_available=True),
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_main.id,
                 name="순대", price=4000, description="찹쌀순대",
                 sort_order=2, is_popular=False, is_available=True),
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_main.id,
                 name="라면", price=4500, description="신라면 + 계란",
                 sort_order=3, is_popular=True, is_available=True),
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_main.id,
                 name="김밥", price=3500, description="참치김밥",
                 sort_order=4, is_popular=False, is_available=True),
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_side.id,
                 name="튀김 모듬", price=3000, description="고구마, 김말이, 오징어",
                 sort_order=1, is_popular=False, is_available=True),
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_side.id,
                 name="계란찜", price=3000, description="뚝배기 계란찜",
                 sort_order=2, is_popular=False, is_available=True),
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_drink.id,
                 name="콜라", price=2000, description="코카콜라 500ml",
                 sort_order=1, is_popular=False, is_available=True),
            Menu(id=uuid.uuid4(), store_id=store_id, category_id=cat_drink.id,
                 name="사이다", price=2000, description="칠성사이다 500ml",
                 sort_order=2, is_popular=False, is_available=True),
        ]
        db.add_all(menus)

        # ── Option Groups ──
        og_spicy = OptionGroup(
            id=uuid.uuid4(), store_id=store_id, name="맵기 선택", is_required=True
        )
        og_topping = OptionGroup(
            id=uuid.uuid4(), store_id=store_id, name="토핑 추가", is_required=False
        )
        db.add_all([og_spicy, og_topping])

        # ── Option Items ──
        db.add_all([
            OptionItem(id=uuid.uuid4(), option_group_id=og_spicy.id, name="순한맛", extra_price=0, sort_order=1),
            OptionItem(id=uuid.uuid4(), option_group_id=og_spicy.id, name="보통맛", extra_price=0, sort_order=2),
            OptionItem(id=uuid.uuid4(), option_group_id=og_spicy.id, name="매운맛", extra_price=0, sort_order=3),
            OptionItem(id=uuid.uuid4(), option_group_id=og_spicy.id, name="극매운맛", extra_price=500, sort_order=4),
            OptionItem(id=uuid.uuid4(), option_group_id=og_topping.id, name="치즈", extra_price=1000, sort_order=1),
            OptionItem(id=uuid.uuid4(), option_group_id=og_topping.id, name="계란", extra_price=500, sort_order=2),
            OptionItem(id=uuid.uuid4(), option_group_id=og_topping.id, name="떡 추가", extra_price=1000, sort_order=3),
        ])

        # ── Menu-OptionGroup Links (떡볶이, 라면에 맵기/토핑 연결) ──
        tteok = menus[0]  # 떡볶이
        ramen = menus[2]  # 라면
        db.add_all([
            MenuOptionGroup(id=uuid.uuid4(), menu_id=tteok.id, option_group_id=og_spicy.id),
            MenuOptionGroup(id=uuid.uuid4(), menu_id=tteok.id, option_group_id=og_topping.id),
            MenuOptionGroup(id=uuid.uuid4(), menu_id=ramen.id, option_group_id=og_spicy.id),
            MenuOptionGroup(id=uuid.uuid4(), menu_id=ramen.id, option_group_id=og_topping.id),
        ])

        await db.commit()

    await engine.dispose()
    print("=== Seed 데이터 생성 완료 ===")
    print(f"매장: 오웬의 분식집")
    print(f"관리자: admin / admin1234")
    print(f"테이블: 1~5번 (비밀번호: table1 ~ table5)")
    print(f"카테고리: 메인 메뉴(4), 사이드(2), 음료(2)")
    print(f"메뉴: 8개 (떡볶이, 순대, 라면, 김밥, 튀김모듬, 계란찜, 콜라, 사이다)")
    print(f"옵션 그룹: 맵기 선택(필수), 토핑 추가(선택)")
    print(f"옵션-메뉴 연결: 떡볶이, 라면에 맵기/토핑 연결")


if __name__ == "__main__":
    asyncio.run(seed())
