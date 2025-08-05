# FILE: agents.py
# PURPOSE: Updated with a more intelligent and explicit prompt for the researcher agent.

import os
import traceback
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.tools.retriever import create_retriever_tool
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from typing import List, Dict, Optional
from langchain_core.tools import BaseTool # Import BaseTool for type hinting

load_dotenv()

# --- 1. Initialize the LLM ---
llm = ChatGroq(
    temperature=0,
    model_name="llama3-70b-8192",
    api_key=os.environ.get("GROQ_API_KEY")
)

# --- 2. Define Tools ---
search_tool = TavilySearchResults(max_results=4)

# --- 3. Create Agents & Chains ---

# UPDATED: This function now has a much smarter and more explicit prompt.
def create_researcher_agent(retriever_tool: Optional[BaseTool] = None):
    researcher_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a world-class market researcher. Your task is to create a detailed market research report for the user's product idea.

        **Your Instructions:**
        1.  **Analyze the User's Product Idea:** First, understand the core concept of the user's product idea provided in the `{product_idea}` input.
        2.  **Prioritize Private Documents:** You have a special tool named `product_document_search` for searching the user's uploaded documents. To use it, you MUST provide a search `query`. For example, to find the target audience, call the tool with a query like `{{'query': 'target audience for {product_idea}'}}`.
        3.  **Use Public Web Search if Needed:** If the private documents do not contain enough information, or for general competitor analysis, use the `tavily_search_results_json` tool.
        4.  **Synthesize, Do Not Just List:** After gathering information, you MUST synthesize it into a coherent report. Do not just list the raw text chunks you found. Your final output should be a well-structured report with clear sections for "Target Audience," "Key Selling Points," and "Main Competitors," all analyzed specifically in the context of the user's product idea.
        5.  **Final Output:** Present the final, synthesized report as your answer.
        """),
        ("human", "My product idea is: {product_idea}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    
    tools = [search_tool]
    if retriever_tool:
        tools.append(retriever_tool)

    agent = create_tool_calling_agent(llm, tools, researcher_prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

def create_copywriter_chain():
    copywriter_prompt = ChatPromptTemplate.from_template(
        "You are a professional product copywriter. Based on the following market research report, write a compelling product description for an e-commerce page. The description should be engaging and highlight the key selling points.\n\nMarket Research:\n{market_research_report}"
    )
    return copywriter_prompt | llm | StrOutputParser()

def create_ad_copy_chain():
    ad_copy_prompt = ChatPromptTemplate.from_template(
        "You are a digital advertising expert. Based on the following market research report, create a short, punchy ad copy for a social media campaign. It should be designed to grab attention and drive clicks.\n\nMarket Research:\n{market_research_report}"
    )
    return ad_copy_prompt | llm | StrOutputParser()

def create_social_media_chain():
    social_media_prompt = ChatPromptTemplate.from_template(
        "You are a social media strategist. Based on the following market research report, generate a list of 5 engaging social media post ideas for platforms like Instagram and Twitter. The posts should be tailored to the target audience.\n\nReturn your response as a JSON object with a single key 'posts' which is an array of strings."
    )
    return social_media_prompt | llm | JsonOutputParser()

def create_scheduler_chain():
    scheduler_prompt = ChatPromptTemplate.from_template(
        """You are an expert social media scheduler. Your task is to take a list of social media posts and create a 5-day content calendar.
        
        - Distribute the posts strategically over the 5 days, assigning one post per day.
        - Choose optimal posting times (e.g., '9:00 AM', '1:00 PM', '5:00 PM').
        - The schedule must start on the day after tomorrow to give the user time to prepare.
        - IMPORTANT: Every single item in the schedule array MUST have a valid, non-null string for 'day', 'time', and 'content'.

        Here are the posts:
        {social_posts}

        Return your response as a JSON object with a single key 'schedule'. The value should be an array of objects, where each object has three keys: 'day' (e.g., 'Day 1', 'Day 2'), 'time' (e.g., '10:00 AM'), and 'content' (the post text).
        """
    )
    return scheduler_prompt | llm | JsonOutputParser()


# --- 4. Combine into a Single Workflow ---
def generate_full_launch_kit(product_idea: str, vector_store: Optional[FAISS] = None):
    retriever_tool = None
    if vector_store:
        retriever = vector_store.as_retriever()
        retriever_tool = create_retriever_tool(
            retriever,
            "product_document_search",
            "Searches and returns relevant information from the user's private product documents. The input must be a string containing a search query."
        )

    researcher = create_researcher_agent(retriever_tool)
    
    copywriter = create_copywriter_chain()
    ad_creator = create_ad_copy_chain()
    social_strategist = create_social_media_chain()
    scheduler = create_scheduler_chain()

    try:
        print("--- 1. Running Market Research Agent ---")
        research_result = researcher.invoke({"product_idea": product_idea})
        market_research_report = research_result.get("output", "Agent did not produce an output.")
        print(f"--- Research successful ---")
    except Exception as e:
        print(f"!!! AGENT CRASHED: {e}")
        traceback.print_exc()
        raise e

    print("\n--- 2. Generating Product Copy ---")
    product_copy = copywriter.invoke({"market_research_report": market_research_report})
    
    print("\n--- 3. Generating Ad Copy ---")
    ad_copy = ad_creator.invoke({"market_research_report": market_research_report})

    print("\n--- 4. Generating Social Media Posts ---")
    social_posts_json = social_strategist.invoke({"market_research_report": market_research_report})
    social_posts = social_posts_json.get("posts", [])

    print("\n--- 5. Scheduling Social Media Posts ---")
    schedule_json = scheduler.invoke({"social_posts": social_posts})
    schedule_list = schedule_json.get("schedule", [])

    filtered_schedule = [item for item in schedule_list if item.get("content")]

    return {
        "market_analysis": market_research_report,
        "product_copy": product_copy,
        "ad_copy": ad_copy,
        "social_posts": social_posts,
        "schedule": filtered_schedule
    }


# --- 5. Test the Full Workflow ---
if __name__ == '__main__':
    product_idea = "A smart dog collar that translates barks into English."
    full_kit = generate_full_launch_kit(product_idea)
    
    print("\n\n--- 🚀 FINAL LAUNCH KIT 🚀 ---")
    print("\n--- Social Media Schedule ---")
    for item in full_kit["schedule"]:
        print(f"- {item.get('day')} at {item.get('time')}: {item.get('content')}")
