"""empty message

Revision ID: 029d9a77a5e9
Revises: 9ce8dcc6ad7e
Create Date: 2024-10-05 20:49:23.433509

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '029d9a77a5e9'
down_revision: Union[str, None] = '9ce8dcc6ad7e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('test_results', sa.Column('status', sa.String(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('test_results', 'status')
    # ### end Alembic commands ###
