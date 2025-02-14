import axios from "axios";
import {
    AccessTokenResp,
    ChatModelInfo,
    ChatBody,
    ChatResp,
    ChatModel,
    Text2ImageBody,
    Text2ImageResp,
} from "./interface";

export class Qianfan {
    private API_KEY: string;
    private SECRET_KEY: string;
    private headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    private readonly api_base =
        "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop";
    private readonly chat_models: ChatModelInfo = {
        "ERNIE-Bot-4": {
            endpoint: "completions_pro",
        },
        "ERNIE-Bot": {
            endpoint: "completions",
        },
        "ERNIE-Bot-turbo": {
            endpoint: "eb-instant",
        },
        "BLOOMZ-7B": {
            endpoint: "bloomz_7b1",
        },
        "Qianfan-BLOOMZ-7B-compressed": {
            endpoint: "qianfan_bloomz_7b_compressed",
        },
        "Llama-2-7b-chat": {
            endpoint: "llama_2_7b",
        },
        "Llama-2-13b-chat": {
            endpoint: "llama_2_13b",
        },
        "Llama-2-70b-chat": {
            endpoint: "llama_2_70b",
        },
        "Qianfan-Chinese-Llama-2-7B": {
            endpoint: "qianfan_chinese_llama_2_7b",
        },
        "ChatGLM2-6B-32K": {
            endpoint: "chatglm2_6b_32k",
        },
        "AquilaChat-7B": {
            endpoint: "aquilachat_7b",
        },
    };
    access_token: string = "";
    expires_in: number = 0;
    /**
     * 千帆大模型
     * @param API_KEY 应用的API Key，在千帆控制台-应用列表查看
     * @param SECRET_KEY 应用的Secret Key，在千帆控制台-应用列表查看
     * @param SERVICE_NAME_SUFFIX 只有服务状态为上线状态，才可以查看自动生成的服务地址、服务后缀名称
     */
    constructor(API_KEY: string, SECRET_KEY: string) {
        this.API_KEY = API_KEY;
        this.SECRET_KEY = SECRET_KEY;
        this.SERVICE_NAME_SUFFIX = SERVICE_NAME_SUFFIX;
    }

    /**
     * 获取access_token
     * @returns Promise<AccessTokenResp>
     */
    public async getAccessToken(): Promise<AccessTokenResp> {
        const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.API_KEY}&client_secret=${this.SECRET_KEY}`;
        const resp = await axios.post(url, {}, { headers: this.headers });
        if (resp.data?.error && resp.data?.error_description) {
            throw new Error(resp.data.error_description);
        }
        this.access_token = resp.data.access_token;
        this.expires_in = resp.data.expires_in + Date.now() / 1000;
        return {
            access_token: resp.data.access_token,
            expires_in: resp.data.expires_in,
        };
    }

    /**
     * 发起对话请求
     * @param model 模型名称
     * @param body 请求参数
     * @returns Promise<ChatResp>
     */
    public async chat<T extends ChatModel>(
        body: ChatBody<T>,
        model: T = "ERNIE-Bot" as T,
    ): Promise<ChatResp<T>> {
        const endpoint = this.chat_models[model].endpoint;
        if (this.expires_in < Date.now() / 1000) {
            await this.getAccessToken();
        }
        const url = `${this.api_base}/chat/${endpoint}?access_token=${this.access_token}`;
        const resp = await axios.post(url, body, { headers: this.headers });
        if (resp.data?.error_code && resp.data?.error_msg) {
            throw new Error(resp.data.error_msg);
        }
        return resp.data as ChatResp<T>;
    }

    /**
     * 插件应用-知识库 ：https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Blmygz6t6
     * @param model 模型名称
     * @param body 请求参数
     * @returns Promise<ChatResp>
     */
    public async plugin(body: PluginBody): Promise<PluginResp> {
        if (this.expires_in < Date.now() / 1000) {
            await this.getAccessToken();
        }
        const url = `${this.api_base}/plugin/${SERVICE_NAME_SUFFIX}?access_token=${this.access_token}`;
        const resp = await axios.post(url, body, { headers: this.headers });
        if (resp.data?.error_code && resp.data?.error_msg) {
            throw new Error(resp.data.error_msg);
        }
        return resp.data as PluginResp<T>;
    }
    
    /**
     * 发起文生图请求
     * @param body 请求参数
     * @returns Promise<Text2ImageResp>
     */
    public async text2image(body: Text2ImageBody): Promise<Text2ImageResp> {
        const endpoint = "sd_xl";
        if (this.expires_in < Date.now() / 1000) {
            await this.getAccessToken();
        }
        const url = `${this.api_base}/text2image/${endpoint}?access_token=${this.access_token}`;
        const resp = await axios.post(url, body, { headers: this.headers });
        if (resp.data?.error_code && resp.data?.error_msg) {
            throw new Error(resp.data.error_msg);
        }
        return resp.data as Text2ImageResp;
    }
}
