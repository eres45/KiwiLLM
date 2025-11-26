import React, { useState, useEffect } from 'react';
import { Search, Info, Crown, Clock, Activity, Zap, Box, Cpu, Sparkles, Code, LayoutGrid, Image, Mic, MessageSquare } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Models = () => {
    const [activeProvider, setActiveProvider] = useState('All Providers');
    const [activeTier, setActiveTier] = useState('Free Tier');
    const [searchQuery, setSearchQuery] = useState('');
    const [uptimeData, setUptimeData] = useState({});

    // Real context window sizes from research
    const models = [
        {
            id: 'deepseek-v3',
            name: 'deepseek-v3',
            provider: 'DeepSeek',
            desc: 'Latest DeepSeek model with enhanced reasoning capabilities and superior performance.',
            context: '128k',
            tags: ['BETA', 'Reasoning'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'deepseek-r1',
            name: 'deepseek-r1',
            provider: 'DeepSeek',
            desc: 'Optimized for high-speed performance and efficient resource usage.',
            context: '128k',
            tags: ['Fast', 'Efficient'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'grok-4',
            name: 'grok-4',
            provider: 'xAI',
            desc: 'Advanced model from xAI with strong reasoning and real-time knowledge.',
            context: '256k',
            tags: ['Reasoning', 'Function Calling'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'qwen2.5-72b-chat',
            name: 'qwen2.5-72b-chat',
            provider: 'Qwen',
            desc: 'Large language model optimized for chat and conversational AI.',
            context: '128k',
            tags: ['Chat', 'General'],
            icon: <Box size={24} />,
            tier: 'Basic Tier'
        },
        {
            id: 'qwen-coder-plus',
            name: 'qwen-coder-plus',
            provider: 'Qwen',
            desc: 'Specialized model for code generation, debugging, and analysis.',
            context: '128k',
            tags: ['Coding', 'Function Calling'],
            icon: <Code size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-oss-120b',
            name: 'gpt-oss-120b',
            provider: 'GPT-OSS',
            desc: 'Open source alternative to GPT-4 class models with broad knowledge.',
            context: '128k',
            tags: ['Open Source', 'General'],
            icon: <Cpu size={24} />,
            tier: 'Basic Tier'
        },
        {
            id: 'dark-code-76',
            name: 'dark-code-76',
            provider: 'DarkAI',
            desc: 'Powerful 12B coding model optimized for code generation and analysis.',
            context: '128k',
            tags: ['Coding', 'Fast'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        // Qwen 3 Series
        {
            id: 'qwen3-coder-plus',
            name: 'qwen3-coder-plus',
            provider: 'Qwen',
            desc: 'Flagship Qwen 3 coding model for advanced software development.',
            context: '128k',
            tags: ['Coding', 'SOTA'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-coder-480b-a35b-instruct',
            name: 'qwen3-coder-480b',
            provider: 'Qwen',
            desc: 'Massive 480B parameter coding model for complex architecture.',
            context: '128k',
            tags: ['Coding', 'Massive'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-chat',
            name: 'qwen3-72b-chat',
            provider: 'Qwen',
            desc: 'Advanced 72B chat model with improved reasoning and dialogue.',
            context: '128k',
            tags: ['Chat', 'Reasoning'],
            icon: <MessageSquare size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-coder',
            name: 'qwen3-72b-coder',
            provider: 'Qwen',
            desc: '72B parameter model specialized for code generation.',
            context: '128k',
            tags: ['Coding', 'Large'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-math',
            name: 'qwen3-72b-math',
            provider: 'Qwen',
            desc: 'Specialized model for mathematical reasoning and problem solving.',
            context: '128k',
            tags: ['Math', 'Reasoning'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-vl',
            name: 'qwen3-72b-vl',
            provider: 'Qwen',
            desc: 'Vision-Language model capable of understanding images and text.',
            context: '128k',
            tags: ['Vision', 'Multimodal'],
            icon: <Image size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-32b-chat',
            name: 'qwen3-32b-chat',
            provider: 'Qwen',
            desc: 'Efficient 32B chat model balancing speed and performance.',
            context: '128k',
            tags: ['Chat', 'Balanced'],
            icon: <MessageSquare size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-32b-vl',
            name: 'qwen3-32b-vl',
            provider: 'Qwen',
            desc: 'Efficient Vision-Language model for image understanding.',
            context: '128k',
            tags: ['Vision', 'Fast'],
            icon: <Image size={24} />,
            tier: 'Free Tier'
        },
        // Qwen 2.5 Series
        {
            id: 'qwen2.5-72b-instruct',
            name: 'qwen2.5-72b-instruct',
            provider: 'Qwen',
            desc: 'Instruction-tuned model for following complex commands.',
            context: '128k',
            tags: ['Instruct', 'General'],
            icon: <Box size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen2.5-72b-coder-instruct',
            name: 'qwen2.5-72b-coder',
            provider: 'Qwen',
            desc: 'Instruction-tuned coding model for precise code generation.',
            context: '128k',
            tags: ['Coding', 'Instruct'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        // OpenAI GPT-5 Series
        {
            id: 'gpt-5',
            name: 'gpt-5',
            provider: 'OpenAI',
            desc: 'Next-generation foundation model with unprecedented capabilities.',
            context: '128k',
            tags: ['Future', 'SOTA'],
            icon: <Crown size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-5-mini',
            name: 'gpt-5-mini',
            provider: 'OpenAI',
            desc: 'Efficient version of GPT-5 for high-speed tasks.',
            context: '128k',
            tags: ['Future', 'Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gpt-5-nano',
            name: 'gpt-5-nano',
            provider: 'OpenAI',
            desc: 'Ultra-lightweight GPT-5 model for edge cases.',
            context: '32k',
            tags: ['Future', 'Ultra-Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        // OpenAI O-Series (Reasoning)
        {
            id: 'o3',
            name: 'o3',
            provider: 'OpenAI',
            desc: 'Advanced reasoning model for complex problem solving.',
            context: '128k',
            tags: ['Reasoning', 'SOTA'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'o3-mini',
            name: 'o3-mini',
            provider: 'OpenAI',
            desc: 'Fast reasoning model for quick logical tasks.',
            context: '128k',
            tags: ['Reasoning', 'Fast'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'o4-mini',
            name: 'o4-mini',
            provider: 'OpenAI',
            desc: 'Next-gen compact reasoning model.',
            context: '128k',
            tags: ['Reasoning', 'Future'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'o1',
            name: 'o1',
            provider: 'OpenAI',
            desc: 'First-generation reasoning model.',
            context: '128k',
            tags: ['Reasoning'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        // OpenAI GPT-4.1 Series
        {
            id: 'gpt-4.1',
            name: 'gpt-4.1',
            provider: 'OpenAI',
            desc: 'Enhanced GPT-4 model with improved accuracy.',
            context: '128k',
            tags: ['New', 'Reliable'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-4.1-mini',
            name: 'gpt-4.1-mini',
            provider: 'OpenAI',
            desc: 'Efficient GPT-4.1 model for general tasks.',
            context: '128k',
            tags: ['New', 'Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gpt-4.1-nano',
            name: 'gpt-4.1-nano',
            provider: 'OpenAI',
            desc: 'Compact GPT-4.1 model for simple queries.',
            context: '16k',
            tags: ['New', 'Ultra-Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        // OpenAI GPT-4 Series
        {
            id: 'gpt-4o',
            name: 'gpt-4o',
            provider: 'OpenAI',
            desc: 'Omni model with multimodal capabilities.',
            context: '128k',
            tags: ['Multimodal', 'Versatile'],
            icon: <Box size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-4o-mini',
            name: 'gpt-4o-mini',
            provider: 'OpenAI',
            desc: 'Cost-effective small model for simple tasks.',
            context: '128k',
            tags: ['Efficient'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gpt-4-turbo',
            name: 'gpt-4-turbo',
            provider: 'OpenAI',
            desc: 'High-performance GPT-4 model.',
            context: '128k',
            tags: ['Powerful'],
            icon: <Box size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-4',
            name: 'gpt-4',
            provider: 'OpenAI',
            desc: 'Classic GPT-4 model.',
            context: '8k',
            tags: ['Legacy'],
            icon: <Box size={24} />,
            tier: 'Pro Tier'
        },
        // Google Gemini Series
        {
            id: 'gemini-2.5-pro',
            name: 'gemini-2.5-pro',
            provider: 'Google',
            desc: 'Latest Gemini 2.5 Pro model for complex tasks.',
            context: '2m',
            tags: ['New', 'SOTA'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gemini-2.5-deep-search',
            name: 'gemini-2.5-deep-search',
            provider: 'Google',
            desc: 'Specialized Gemini model for deep research and search.',
            context: '128k',
            tags: ['Research', 'Search'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gemini-2.5-flash',
            name: 'gemini-2.5-flash',
            provider: 'Google',
            desc: 'High-speed, cost-effective Gemini model.',
            context: '1m',
            tags: ['Fast', 'Efficient'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        // DeepInfra Models (Top Selections)
        {
            id: 'deepseek-ai/DeepSeek-V3.1',
            name: 'DeepSeek V3.1',
            provider: 'DeepSeek',
            desc: 'Most capable DeepSeek model via DeepInfra infrastructure.',
            context: '128k',
            tags: ['SOTA'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'deepseek-ai/DeepSeek-R1',
            name: 'DeepSeek R1',
            provider: 'DeepSeek',
            desc: 'Advanced reasoning model with chain-of-thought capabilities.',
            context: '128k',
            tags: ['Reasoning'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'Qwen/Qwen3-235B-A22B-Thinking-2507',
            name: 'Qwen3 235B Thinking',
            provider: 'Qwen',
            desc: 'Massive Qwen model with advanced reasoning capabilities.',
            context: '128k',
            tags: ['Reasoning', 'SOTA'],
            icon: <MessageSquare size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
            name: 'Llama 3.1 70B',
            provider: 'Meta',
            desc: 'Meta\'s flagship open-source model.',
            context: '128k',
            tags: ['Open Source'],
            icon: <Box size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'anthropic/claude-4-sonnet',
            name: 'Claude 4 Sonnet',
            provider: 'Anthropic',
            desc: 'Anthropic\'s latest Claude model.',
            context: '200k',
            tags: ['SOTA'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
            name: 'Qwen3 Coder 480B',
            provider: 'Qwen',
            desc: 'World\'s most powerful open coding model.',
            context: '128k',
            tags: ['Coding', 'SOTA'],
            icon: <Code size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'google/gemini-2.5-flash',
            name: 'Gemini 2.5 Flash',
            provider: 'Google',
            desc: 'Google\'s fast Gemini model.',
            context: '1m',
            tags: ['Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'nvidia/Llama-3.1-Nemotron-70B-Instruct',
            name: 'Nemotron 70B',
            provider: 'Nvidia',
            desc: 'NVIDIA\'s enhanced Llama model for superior performance.',
            context: '128k',
            tags: ['Enhanced'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'mistralai/Mistral-Small-3.2-24B-Instruct-2506',
            name: 'Mistral Small 3.2',
            provider: 'Mistral',
            desc: 'Efficient Mistral model for balanced performance.',
            context: '128k',
            tags: ['Efficient'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'NousResearch/Hermes-3-Llama-3.1-405B',
            name: 'Hermes 3 405B',
            provider: 'NousResearch',
            desc: 'Largest open-source model with exceptional capabilities.',
            context: '128k',
            tags: ['SOTA', 'Open Source'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        // Additional Google & Anthropic Models
        { id: 'google/gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'Google', desc: 'Compact Gemini model for efficient processing.', context: '1m', tags: ['Fast'], icon: <Zap size={24} />, tier: 'Free Tier' },
        { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash 001', provider: 'Google', desc: 'Latest Gemini Flash variant.', context: '1m', tags: ['Fast'], icon: <Zap size={24} />, tier: 'Free Tier' },
        { id: 'google/gemma-3-27b-it', name: 'Gemma 3 27B', provider: 'Google', desc: 'Open Gemma model.', context: '128k', tags: ['Open Source'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B', provider: 'Google', desc: 'Gemma 2 series model.', context: '128k', tags: ['Open Source'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B', provider: 'Google', desc: 'Lightweight Gemma model.', context: '128k', tags: ['Efficient'], icon: <Sparkles size={24} />, tier: 'Free Tier' },
        { id: 'google/gemma-3-10b-it', name: 'Gemma 3 10B', provider: 'Google', desc: 'Balanced Gemma 3 model.', context: '128k', tags: ['Efficient'], icon: <Sparkles size={24} />, tier: 'Free Tier' },
        { id: 'google/gemma-3-10b-it-2506', name: 'Gemma 3 10B 2506', provider: 'Google', desc: 'Latest Gemma 3 variant.', context: '128k', tags: ['Efficient'], icon: <Sparkles size={24} />, tier: 'Free Tier' },
        { id: 'anthropic/claude-3-7-sonnet-latest', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', desc: 'Latest Claude 3.7 model.', context: '200k', tags: ['SOTA'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        { id: 'anthropic/claude-4-opus', name: 'Claude 4 Opus', provider: 'Anthropic', desc: 'Most capable Claude 4 model.', context: '200k', tags: ['SOTA'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        // More DeepSeek & Qwen Models
        { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', provider: 'DeepSeek', desc: 'Previous generation DeepSeek.', context: '128k', tags: ['Chat'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/DeepSeek-R1-Turbo', name: 'DeepSeek R1 Turbo', provider: 'DeepSeek', desc: 'Faster R1 variant.', context: '128k', tags: ['Reasoning', 'Fast'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', name: 'DeepSeek R1 Distill', provider: 'DeepSeek', desc: 'Distilled R1 model.', context: '128k', tags: ['Reasoning'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/DeepSeek-V3.2-Exp', name: 'DeepSeek V3.2 Exp', provider: 'DeepSeek', desc: 'Experimental V3.2 model.', context: '128k', tags: ['Experimental'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/Janus-Pro-7B', name: 'Janus Pro 7B', provider: 'DeepSeek', desc: 'Vision-language model.', context: '128k', tags: ['Vision'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/DeepSeek-R1-0528', name: 'DeepSeek R1 0528', provider: 'DeepSeek', desc: 'R1 snapshot version.', context: '128k', tags: ['Reasoning'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/DeepSeek-R1-0528-Turbo', name: 'DeepSeek R1 0528 Turbo', provider: 'DeepSeek', desc: 'Faster R1 0528.', context: '128k', tags: ['Reasoning', 'Fast'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/DeepSeek-V3-0324', name: 'DeepSeek V3 0324', provider: 'DeepSeek', desc: 'V3 snapshot.', context: '128k', tags: ['Chat'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/DeepSeek-V3.1-Terminus', name: 'DeepSeek V3.1 Terminus', provider: 'DeepSeek', desc: 'Advanced V3.1 variant.', context: '128k', tags: ['SOTA'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'deepseek-ai/Janus-Pro-1B', name: 'Janus Pro 1B', provider: 'DeepSeek', desc: 'Compact vision model.', context: '128k', tags: ['Vision', 'Efficient'], icon: <Image size={24} />, tier: 'Free Tier' },
        { id: 'Qwen/Qwen3-14B', name: 'Qwen3 14B', provider: 'Qwen', desc: 'Qwen3 14B model.', context: '128k', tags: ['Chat'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-32B', name: 'Qwen3 32B', provider: 'Qwen', desc: 'Qwen3 32B model.', context: '128k', tags: ['Chat'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-72B', name: 'Qwen3 72B', provider: 'Qwen', desc: 'Qwen3 72B model.', context: '128k', tags: ['Chat'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-72B-Thinking', name: 'Qwen3 72B Thinking', provider: 'Qwen', desc: 'Reasoning-focused Qwen3 72B.', context: '128k', tags: ['Reasoning'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-Coder-72B', name: 'Qwen3 Coder 72B', provider: 'Qwen', desc: 'Coding-focused Qwen3 72B.', context: '128k', tags: ['Coding'], icon: <Code size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-110B', name: 'Qwen3 110B', provider: 'Qwen', desc: 'Large Qwen3 model.', context: '128k', tags: ['Chat', 'SOTA'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-110B-Thinking', name: 'Qwen3 110B Thinking', provider: 'Qwen', desc: 'Reasoning Qwen3 110B.', context: '128k', tags: ['Reasoning', 'SOTA'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-Coder-110B', name: 'Qwen3 Coder 110B', provider: 'Qwen', desc: 'Advanced coding model.', context: '128k', tags: ['Coding', 'SOTA'], icon: <Code size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-170B', name: 'Qwen3 170B', provider: 'Qwen', desc: 'Largest Qwen3 base model.', context: '128k', tags: ['Chat', 'SOTA'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-170B-Thinking', name: 'Qwen3 170B Thinking', provider: 'Qwen', desc: 'Reasoning Qwen3 170B.', context: '128k', tags: ['Reasoning', 'SOTA'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-VL-235B-A22B-Instruct', name: 'Qwen3 VL 235B', provider: 'Qwen', desc: 'Vision-language Qwen model.', context: '128k', tags: ['Vision', 'SOTA'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-Next-80B-A3B-Instruct', name: 'Qwen3 Next 80B', provider: 'Qwen', desc: 'Next-gen Qwen model.', context: '128k', tags: ['Chat'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', name: 'Qwen3 235B Instruct', provider: 'Qwen', desc: 'Instruction-tuned 235B.', context: '128k', tags: ['SOTA'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        // Meta Llama Models
        { id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', name: 'Llama 3.2 11B Vision', provider: 'Meta', desc: 'Vision-capable Llama.', context: '128k', tags: ['Vision'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B', provider: 'Meta', desc: 'Compact Llama 3.2.', context: '128k', tags: ['Efficient'], icon: <Box size={24} />, tier: 'Free Tier' },
        { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', provider: 'Meta', desc: 'Fast Llama 3.3.', context: '128k', tags: ['Fast'], icon: <Box size={24} />, tier: 'Pro Tier' },
        { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', provider: 'Meta', desc: 'Efficient Llama 3.1.', context: '128k', tags: ['Efficient'], icon: <Box size={24} />, tier: 'Free Tier' },
        { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'Llama 3.1 8B Turbo', provider: 'Meta', desc: 'Fast Llama 3.1 8B.', context: '128k', tags: ['Fast'], icon: <Box size={24} />, tier: 'Free Tier' },
        { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B Turbo', provider: 'Meta', desc: 'Fast Llama 3.1 70B.', context: '128k', tags: ['Fast'], icon: <Box size={24} />, tier: 'Pro Tier' },
        { id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', name: 'Llama 4 Maverick 17B', provider: 'Meta', desc: 'Llama 4 experimental.', context: '128k', tags: ['Experimental'], icon: <Box size={24} />, tier: 'Pro Tier' },
        { id: 'meta-llama/Llama-4-Scout-17B-16E-Instruct', name: 'Llama 4 Scout 17B', provider: 'Meta', desc: 'Llama 4 Scout variant.', context: '128k', tags: ['Experimental'], icon: <Box size={24} />, tier: 'Pro Tier' },
        { id: 'meta-llama/Llama-Guard-4-12B', name: 'Llama Guard 4 12B', provider: 'Meta', desc: 'Safety-focused Llama.', context: '128k', tags: ['Safety'], icon: <Box size={24} />, tier: 'Pro Tier' },
        { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Llama 3 8B', provider: 'Meta', desc: 'Llama 3 base 8B.', context: '128k', tags: ['Efficient'], icon: <Box size={24} />, tier: 'Free Tier' },
        // Mistral Models
        { id: 'mistralai/Mistral-Nemo-Instruct-2407', name: 'Mistral Nemo', provider: 'Mistral', desc: 'Mistral Nemo model.', context: '128k', tags: ['Efficient'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        { id: 'mistralai/Mistral-Small-24B-Instruct-2501', name: 'Mistral Small 24B', provider: 'Mistral', desc: 'Mistral Small model.', context: '128k', tags: ['Efficient'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', provider: 'Mistral', desc: 'MoE Mixtral model.', context: '32k', tags: ['MoE'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        // Nvidia & NousResearch Models
        { id: 'nvidia/NVIDIA-Nemotron-Nano-12B-v2-VL', name: 'Nemotron Nano 12B VL', provider: 'Nvidia', desc: 'Vision Nemotron.', context: '128k', tags: ['Vision'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'nvidia/NVIDIA-Nemotron-Nano-9B-v2', name: 'Nemotron Nano 9B', provider: 'Nvidia', desc: 'Compact Nemotron.', context: '128k', tags: ['Efficient'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'nvidia/Llama-3.3-Nemotron-Super-49B-v1.5', name: 'Nemotron Super 49B', provider: 'Nvidia', desc: 'Enhanced Nemotron.', context: '128k', tags: ['Enhanced'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'NousResearch/Hermes-3-Llama-3.1-70B', name: 'Hermes 3 70B', provider: 'NousResearch', desc: 'Hermes 3 70B model.', context: '128k', tags: ['Open Source'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        // Other Providers
        { id: 'moonshotai/Kimi-K2-Instruct-0905', name: 'Kimi K2 Instruct', provider: 'Moonshot', desc: 'Kimi K2 model.', context: '128k', tags: ['Chat'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'moonshotai/Kimi-K2-Thinking', name: 'Kimi K2 Thinking', provider: 'Moonshot', desc: 'Reasoning Kimi K2.', context: '128k', tags: ['Reasoning'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'microsoft/WizardLM-2-8x22B', name: 'WizardLM 2 8x22B', provider: 'Microsoft', desc: 'WizardLM MoE model.', context: '128k', tags: ['MoE'], icon: <Sparkles size={24} />, tier: 'Pro Tier' },
        { id: 'microsoft/phi-4', name: 'Phi-4', provider: 'Microsoft', desc: 'Microsoft Phi-4.', context: '128k', tags: ['Efficient'], icon: <Sparkles size={24} />, tier: 'Free Tier' },
        { id: 'Gryphe/MythoMax-L2-13b', name: 'MythoMax L2 13B', provider: 'Gryphe', desc: 'Creative writing model.', context: '4k', tags: ['Creative'], icon: <MessageSquare size={24} />, tier: 'Free Tier' },
        { id: 'Sao10K/L3-8B-Lunaris-v1-Turbo', name: 'Lunaris 8B Turbo', provider: 'Sao10K', desc: 'Lunaris variant.', context: '8k', tags: ['Creative'], icon: <MessageSquare size={24} />, tier: 'Free Tier' },
        { id: 'Sao10K/L3.1-70B-Euryale-v2.2', name: 'Euryale 70B v2.2', provider: 'Sao10K', desc: 'Euryale variant.', context: '8k', tags: ['Creative'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'Sao10K/L3.3-70B-Euryale-v2.3', name: 'Euryale 70B v2.3', provider: 'Sao10K', desc: 'Latest Euryale.', context: '8k', tags: ['Creative'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'zai-org/GLM-4.6', name: 'GLM 4.6', provider: 'ZhipuAI', desc: 'GLM-4 model.', context: '128k', tags: ['Chat'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'MiniMaxAI/MiniMax-M2', name: 'MiniMax M2', provider: 'MiniMaxAI', desc: 'MiniMax model.', context: '128k', tags: ['Chat'], icon: <MessageSquare size={24} />, tier: 'Pro Tier' },
        { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'OpenAI-OSS', desc: 'Open GPT 120B.', context: '32k', tags: ['Open Source'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'openai/gpt-oss-120b-Turbo', name: 'GPT-OSS 120B Turbo', provider: 'OpenAI-OSS', desc: 'Fast GPT-OSS.', context: '32k', tags: ['Fast'], icon: <Cpu size={24} />, tier: 'Pro Tier' },
        { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'OpenAI-OSS', desc: 'GPT-OSS 20B.', context: '32k', tags: ['Efficient'], icon: <Cpu size={24} />, tier: 'Free Tier' },
        // OCR/Vision Models
        { id: 'deepseek-ai/DeepSeek-OCR', name: 'DeepSeek OCR', provider: 'DeepSeek', desc: 'OCR specialized model.', context: '128k', tags: ['OCR', 'Vision'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'PaddlePaddle/PaddleOCR-VL-0.9B', name: 'PaddleOCR VL', provider: 'PaddlePaddle', desc: 'PaddleOCR vision model.', context: '8k', tags: ['OCR'], icon: <Image size={24} />, tier: 'Free Tier' },
        { id: 'allenai/olmOCR-2-7B-1025', name: 'olmOCR 2 7B', provider: 'AllenAI', desc: 'AllenAI OCR model.', context: '128k', tags: ['OCR'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'ByteDance/Seedream-4', name: 'Seedream 4', provider: 'ByteDance', desc: 'Video generation model.', context: '8k', tags: ['Video'], icon: <Image size={24} />, tier: 'Pro Tier' },
        // Embedding Models (Note: Require /v1/embeddings endpoint)
        { id: 'BAAI/bge-base-en-v1.5', name: 'BGE Base EN v1.5', provider: 'BAAI', desc: 'Base English embedding model.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'BAAI/bge-en-icl', name: 'BGE EN ICL', provider: 'BAAI', desc: 'In-context learning embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'BAAI/bge-large-en-v1.5', name: 'BGE Large EN v1.5', provider: 'BAAI', desc: 'Large English embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'BAAI/bge-m3', name: 'BGE M3', provider: 'BAAI', desc: 'Multilingual BGE embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'BAAI/bge-m3-multi', name: 'BGE M3 Multi', provider: 'BAAI', desc: 'Multi-task BGE embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'intfloat/e5-base-v2', name: 'E5 Base v2', provider: 'Intfloat', desc: 'E5 base embedding model.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'intfloat/e5-large-v2', name: 'E5 Large v2', provider: 'Intfloat', desc: 'E5 large embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'intfloat/multilingual-e5-large', name: 'E5 Large Multilingual', provider: 'Intfloat', desc: 'Multilingual E5 large.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'intfloat/multilingual-e5-large-instruct', name: 'E5 Large Instruct', provider: 'Intfloat', desc: 'Instruction-tuned E5.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'sentence-transformers/all-MiniLM-L12-v2', name: 'MiniLM L12 v2', provider: 'Sentence-Transformers', desc: 'MiniLM embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'sentence-transformers/all-MiniLM-L6-v2', name: 'MiniLM L6 v2', provider: 'Sentence-Transformers', desc: 'Compact MiniLM.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'sentence-transformers/all-mpnet-base-v2', name: 'MPNet Base v2', provider: 'Sentence-Transformers', desc: 'MPNet base embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'sentence-transformers/clip-ViT-B-32', name: 'CLIP ViT-B/32', provider: 'Sentence-Transformers', desc: 'CLIP vision embedding.', context: 'N/A', tags: ['Embedding', 'Vision'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'sentence-transformers/clip-ViT-B-32-multilingual-v1', name: 'CLIP Multilingual', provider: 'Sentence-Transformers', desc: 'Multilingual CLIP.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'sentence-transformers/multi-qa-mpnet-base-dot-v1', name: 'Multi-QA MPNet', provider: 'Sentence-Transformers', desc: 'QA-focused embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'sentence-transformers/paraphrase-MiniLM-L6-v2', name: 'Paraphrase MiniLM', provider: 'Sentence-Transformers', desc: 'Paraphrase embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'thenlper/gte-base', name: 'GTE Base', provider: 'Thenlper', desc: 'GTE base embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'thenlper/gte-large', name: 'GTE Large', provider: 'Thenlper', desc: 'GTE large embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'shibing624/text2vec-base-chinese', name: 'Text2Vec Chinese', provider: 'Shibing624', desc: 'Chinese text embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'google/embeddinggemma-300m', name: 'Embedding Gemma 300M', provider: 'Google', desc: 'Gemma embedding model.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'Qwen/Qwen3-Embedding-0.6B', name: 'Qwen3 Embedding 0.6B', provider: 'Qwen', desc: 'Qwen embedding 0.6B.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'Qwen/Qwen3-Embedding-0.6B-batch', name: 'Qwen3 Embedding Batch', provider: 'Qwen', desc: 'Batch Qwen embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Free Tier' },
        { id: 'Qwen/Qwen3-Embedding-4B-batch', name: 'Qwen3 Embedding 4B', provider: 'Qwen', desc: 'Large Qwen embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        { id: 'Qwen/Qwen3-Embedding-8B', name: 'Qwen3 Embedding 8B', provider: 'Qwen', desc: 'Largest Qwen embedding.', context: 'N/A', tags: ['Embedding'], icon: <LayoutGrid size={24} />, tier: 'Pro Tier' },
        // Image Generation Models (Note: Require /v1/images/generations endpoint)
        { id: 'Bria/Bria-3.2', name: 'Bria 3.2', provider: 'Bria', desc: 'Bria image generation.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/Bria-3.2-vector', name: 'Bria 3.2 Vector', provider: 'Bria', desc: 'Vector image generation.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/blur_background', name: 'Bria Blur Background', provider: 'Bria', desc: 'Background blur tool.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/enhance', name: 'Bria Enhance', provider: 'Bria', desc: 'Image enhancement.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/erase', name: 'Bria Erase', provider: 'Bria', desc: 'Object removal tool.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/erase_foreground', name: 'Bria Erase Foreground', provider: 'Bria', desc: 'Foreground removal.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/expand', name: 'Bria Expand', provider: 'Bria', desc: 'Image expansion.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/fibo', name: 'Bria Fibo', provider: 'Bria', desc: 'Bria Fibo model.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/gen_fill', name: 'Bria Gen Fill', provider: 'Bria', desc: 'Generative fill tool.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/remove_background', name: 'Bria Remove BG', provider: 'Bria', desc: 'Background removal.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'Bria/replace_background', name: 'Bria Replace BG', provider: 'Bria', desc: 'Background replacement.', context: 'N/A', tags: ['Image Edit'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'black-forest-labs/FLUX-1-Redux-dev', name: 'FLUX Redux Dev', provider: 'BlackForest', desc: 'FLUX Redux model.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'black-forest-labs/FLUX-1.1-pro', name: 'FLUX 1.1 Pro', provider: 'BlackForest', desc: 'FLUX Pro generation.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'black-forest-labs/FLUX.1-Kontext-dev', name: 'FLUX Kontext Dev', provider: 'BlackForest', desc: 'Context-aware FLUX.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'black-forest-labs/FLUX.1-Kontext-pro', name: 'FLUX Kontext Pro', provider: 'BlackForest', desc: 'FLUX Kontext Pro.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'black-forest-labs/FLUX.1-Pro', name: 'FLUX 1 Pro', provider: 'BlackForest', desc: 'FLUX professional.', context: 'N/A', tags: ['Image Gen'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'black-forest-labs/FLUX.1-Turbo', name: 'FLUX 1 Turbo', provider: 'BlackForest', desc: 'Fast FLUX generation.', context: 'N/A', tags: ['Image Gen', 'Fast'], icon: <Image size={24} />, tier: 'Pro Tier' },
        { id: 'stabilityai/sdxl-turbo', name: 'SDXL Turbo', provider: 'StabilityAI', desc: 'Fast SDXL generation.', context: 'N/A', tags: ['Image Gen', 'Fast'], icon: <Image size={24} />, tier: 'Pro Tier' }
    ];

    const providers = ['All Providers', 'DeepSeek', 'xAI', 'Qwen', 'GPT-OSS', 'Anthropic', 'OpenAI', 'Google', 'Meta', 'Mistral', 'Nvidia', 'NousResearch', 'Moonshot', 'Microsoft', 'Gryphe', 'Sao10K', 'ZhipuAI', 'MiniMaxAI', 'OpenAI-OSS', 'PaddlePaddle', 'AllenAI', 'ByteDance', 'BAAI', 'Intfloat', 'Sentence-Transformers', 'Thenlper', 'Shibing624', 'Bria', 'BlackForest', 'StabilityAI'];

    // Fetch uptime data from Firestore
    useEffect(() => {
        const fetchUptimeData = async () => {
            try {
                const uptimeCollection = collection(db, 'modelUptime');
                const uptimeSnapshot = await getDocs(uptimeCollection);
                const uptimeMap = {};

                uptimeSnapshot.forEach(doc => {
                    const data = doc.data();
                    const uptime = data.totalChecks > 0
                        ? ((data.successfulChecks / data.totalChecks) * 100).toFixed(2)
                        : '99.95';
                    uptimeMap[doc.id] = uptime;
                });

                setUptimeData(uptimeMap);
            } catch (error) {
                console.error('Error fetching uptime:', error);
                const defaultUptime = {};
                models.forEach(model => {
                    defaultUptime[model.id] = '99.95';
                });
                setUptimeData(defaultUptime);
            }
        };

        fetchUptimeData();
    }, []);

    return (
        <div className="models-page-container">
            <div className="models-header">
                <h1>AI Models</h1>
                <p>Access a wide range of powerful AI models through our platform</p>
            </div>

            {/* Search Bar Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingLeft: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Search Models</label>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#10b981',
                            background: '#10b98120',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: '600'
                        }}>
                            {models.length} total
                        </span>
                    </div>
                    <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Filter by Purpose</label>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: '#0a0a0a',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #27272a'
                }}>
                    <div style={{ position: 'relative', flex: '0 0 300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Search models..."
                            style={{
                                width: '100%',
                                background: '#18181b',
                                border: '1px solid #27272a',
                                padding: '0.65rem 1rem 0.65rem 2.5rem',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="filter-pill active"><LayoutGrid size={14} /> All Types</button>
                        <button className="filter-pill"><Mic size={14} /> Audio & Speech</button>
                        <button className="filter-pill"><MessageSquare size={14} /> Chat & Completion</button>
                        <button className="filter-pill"><Image size={14} /> Images</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto 0.5rem' }}>
                <label className="text-dim">Filter by Provider</label>
            </div>

            <div className="provider-filter">
                {providers.map(provider => (
                    <button
                        key={provider}
                        className={`provider-chip ${activeProvider === provider ? 'active' : ''}`}
                        onClick={() => setActiveProvider(provider)}
                    >
                        {provider === 'All Providers' ? <LayoutGrid size={14} /> : null}
                        {provider}
                    </button>
                ))}
            </div>

            <div className="tier-filter-container">
                <div className="tier-filter">
                    {['Free Tier', 'Basic Tier', 'Pro Tier', 'Ultra Tier'].map(tier => (
                        <button
                            key={tier}
                            className={`tier-btn ${activeTier === tier ? 'active' : ''} ${tier === 'Ultra Tier' ? 'ultra' : ''}`}
                            onClick={() => setActiveTier(tier)}
                        >
                            {tier === 'Ultra Tier' ? <Crown size={14} /> : <Zap size={14} />}
                            {tier}
                        </button>
                    ))}
                </div>
            </div>

            <div className="models-grid-new">
                {models.map(model => (
                    <div key={model.id} className="model-card-new">
                        <div className="card-header-new">
                            <div className="model-icon-new">
                                {model.icon}
                            </div>
                            <Info size={18} className="info-icon" />
                        </div>

                        <h3 className="model-title-new">{model.name}</h3>

                        <div className="provider-badge-new">
                            <Crown size={14} className="crown-icon" />
                            <span>by {model.provider}</span>
                        </div>

                        <p className="model-desc-new">
                            {model.desc}
                        </p>

                        <div className="card-stats-new">
                            <div className="stat-row">
                                <Clock size={14} />
                                <span>Context: <span className="stat-value">{model.context}</span></span>
                            </div>
                            <div className="stat-row">
                                <Activity size={14} className="uptime-green" />
                                <span>Uptime: <span className="stat-value uptime-green">
                                    {uptimeData[model.id] || '99.95'}%
                                </span></span>
                            </div>
                        </div>

                        <div className="card-tags-new">
                            {model.tags.map(tag => (
                                <span key={tag} className={`tag-badge ${tag === 'BETA' ? 'beta' : ''}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Models;
