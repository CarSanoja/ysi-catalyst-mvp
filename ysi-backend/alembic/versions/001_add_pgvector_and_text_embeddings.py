"""Add pgvector extension and text_embeddings table

Revision ID: 001_add_pgvector
Revises: 
Create Date: 2024-09-09 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import pgvector.sqlalchemy

# revision identifiers, used by Alembic.
revision = '001_add_pgvector'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
    
    # Create text_embeddings table
    op.create_table('text_embeddings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('source_id', sa.Integer(), nullable=True),
        sa.Column('chunk_index', sa.Integer(), nullable=True),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('processed_text', sa.Text(), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=True),
        sa.Column('embedding', pgvector.sqlalchemy.Vector(dim=1536), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('language', sa.String(length=5), nullable=True),
        sa.Column('content_type', sa.String(length=50), nullable=True),
        sa.Column('confidence_score', sa.String(), nullable=True),
        sa.Column('session_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('token_count', sa.Integer(), nullable=True),
        sa.Column('processing_duration_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_text_embeddings_id'), 'text_embeddings', ['id'], unique=False)
    op.create_index(op.f('ix_text_embeddings_uuid'), 'text_embeddings', ['uuid'], unique=True)
    op.create_index(op.f('ix_text_embeddings_content_hash'), 'text_embeddings', ['content_hash'], unique=True)
    op.create_index(op.f('ix_text_embeddings_source_type'), 'text_embeddings', ['source_type'], unique=False)
    op.create_index(op.f('ix_text_embeddings_source_id'), 'text_embeddings', ['source_id'], unique=False)
    op.create_index(op.f('ix_text_embeddings_session_id'), 'text_embeddings', ['session_id'], unique=False)
    op.create_index(op.f('ix_text_embeddings_user_id'), 'text_embeddings', ['user_id'], unique=False)
    op.create_index(op.f('ix_text_embeddings_created_at'), 'text_embeddings', ['created_at'], unique=False)
    
    # Composite index for source filtering
    op.create_index('text_embeddings_source_idx', 'text_embeddings', ['source_type', 'source_id', 'chunk_index'])
    
    # Temporal index for time-based queries
    op.create_index('text_embeddings_temporal_idx', 'text_embeddings', ['created_at', 'source_type'])
    
    # HNSW index for vector similarity search (requires pgvector)
    op.execute("""
        CREATE INDEX embedding_hnsw_idx ON text_embeddings 
        USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64)
    """)
    
    # GIN index for metadata JSON queries
    op.execute("""
        CREATE INDEX text_embeddings_metadata_idx ON text_embeddings 
        USING gin (metadata)
    """)


def downgrade() -> None:
    # Drop indexes first
    op.execute('DROP INDEX IF EXISTS embedding_hnsw_idx')
    op.execute('DROP INDEX IF EXISTS text_embeddings_metadata_idx')
    op.drop_index('text_embeddings_temporal_idx', table_name='text_embeddings')
    op.drop_index('text_embeddings_source_idx', table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_created_at'), table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_user_id'), table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_session_id'), table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_source_id'), table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_source_type'), table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_content_hash'), table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_uuid'), table_name='text_embeddings')
    op.drop_index(op.f('ix_text_embeddings_id'), table_name='text_embeddings')
    
    # Drop table
    op.drop_table('text_embeddings')
    
    # Note: We don't drop the extensions as they might be used by other tables
    # op.execute('DROP EXTENSION IF EXISTS vector')
    # op.execute('DROP EXTENSION IF EXISTS pg_trgm')