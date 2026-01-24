from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from app.models import Candidate, Citation, Preference, RagDoc


class ILLMClient(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> str:
        raise NotImplementedError


class DummyLLMClient(ILLMClient):
    def generate(self, prompt: str) -> str:
        return prompt


def _build_citation(doc: RagDoc) -> Citation:
    quote = doc.content.split("。")[0][:120]
    return Citation(doc_id=doc.doc_id, quote=quote, source=doc.source)


def generate_variants(
    user_text: str,
    prefs: Preference,
    docs: List[RagDoc],
    llm_client: ILLMClient | None = None,
) -> List[Candidate]:
    llm_client = llm_client or DummyLLMClient()
    primary_docs = docs[:3] if docs else []
    citations = [_build_citation(doc) for doc in primary_docs]

    base_prompt = (
        "あなたは日本酒の推薦アシスタントです。"
        f"要望: {user_text}。"
        f"甘味{prefs.sweet}・果実感{prefs.fruity}・キレ{prefs.crisp}。"
    )
    llm_client.generate(base_prompt)

    variants = [
        Candidate(
            candidate_id="conservative",
            text=(
                "定番寄りで安心感のある一本を提案します。"
                "香りは穏やかで、料理との相性を重視した選択です。"
            ),
            citations=citations,
        ),
        Candidate(
            candidate_id="distinctive",
            text=(
                "個性派として、香り立ちと果実感が際立つ銘柄を提案します。"
                "飲み比べで印象に残りやすいスタイルです。"
            ),
            citations=citations,
        ),
        Candidate(
            candidate_id="constraint_opt",
            text=(
                "予算やペアリング条件を優先し、バランス良く収まる候補です。"
                "食中酒として扱いやすい仕立てです。"
            ),
            citations=citations,
        ),
    ]
    return variants
